import { parse as parseYaml } from 'yaml';
import type { RuleSetConfigFields } from '@/lib/subconverter/types/rulesets';
import { fail } from './errors';
import { resolveSymbol } from './policies';
import { splitFields } from '../../providers/ini/parser';
import type { MaterializedRuleSource, OutputContext, OutputTarget } from '../../types/output';

export interface RuleCondition {
  type: string;
  value?: string;
  children?: RuleCondition[];
  noResolve: boolean;
}
export interface BoundRule {
  condition: RuleCondition;
  policy: string;
  index: number;
}

const aliases: Record<string, string> = {
  HOST: 'DOMAIN',
  'HOST-SUFFIX': 'DOMAIN-SUFFIX',
  'HOST-KEYWORD': 'DOMAIN-KEYWORD',
  'IP6-CIDR': 'IP-CIDR6',
  'DEST-PORT': 'DST-PORT',
  PORT: 'DST-PORT',
  FINAL: 'MATCH',
};

export function parseCondition(line: string, index: number, sourcePolicy = false): RuleCondition {
  let fields: string[];

  try {
    fields = splitFields(line);
  } catch {
    return fail('rule', index, 'rule', 'invalid-rule-syntax');
  }
  if (/[\r\n\0]/.test(line)) {
    return fail('rule', index, 'rule', 'invalid-rule-line-break');
  }

  const original = fields.shift()?.toUpperCase() ?? '';
  const type = aliases[original] ?? original;
  const noResolve = fields.at(-1)?.toLowerCase() === 'no-resolve';

  if (noResolve) {
    fields.pop();
  }

  const terminal = type === 'MATCH';

  if (sourcePolicy && fields.length === (terminal ? 1 : 2)) {
    fields.pop();
  }

  if ((terminal && fields.length) || (!terminal && fields.length !== 1) || !type) {
    return fail('rule', index, 'rule', 'invalid-rule-arity');
  }

  if (terminal) {
    return { type, noResolve };
  }

  const value = fields[0];

  if (!value) {
    return fail('rule', index, 'rule', 'empty-rule-value');
  }

  if (['AND', 'OR', 'NOT'].includes(type)) {
    if (!value.startsWith('(') || !value.endsWith(')')) {
      return fail('rule', index, 'rule', 'invalid-logical-rule');
    }

    const children = splitFields(value.slice(1, -1)).map((part) => {
      if (!part.startsWith('(') || !part.endsWith(')')) {
        return fail('rule', index, 'rule', 'invalid-logical-condition');
      }

      return parseCondition(part.slice(1, -1), index);
    });

    if (
      !children.length ||
      (type === 'NOT' && children.length !== 1) ||
      children.some((child) => child.type === 'MATCH')
    ) {
      return fail('rule', index, 'rule', 'invalid-logical-operands');
    }

    return { type, children, noResolve };
  }

  return { type, value, noResolve };
}

export function conditionText(
  condition: RuleCondition,
  terminal = 'MATCH',
  rename: Readonly<Record<string, string>> = {},
): string {
  if (condition.type === 'MATCH') {
    return terminal;
  }

  if (condition.children) {
    return `${condition.type},(${condition.children.map((child) => `(${conditionText(child, terminal, rename)}${child.noResolve ? ',no-resolve' : ''})`).join(',')})`;
  }

  return `${rename[condition.type] ?? condition.type},${condition.value}`;
}

export function boundRules(rules: readonly RuleSetConfigFields[], context: OutputContext): BoundRule[] {
  const result: BoundRule[] = [];
  let terminated = false;

  rules.forEach((definition, index) => {
    const policy = resolveSymbol(context.symbols, definition.policy, 'rule', index);
    const lines =
      definition.type === 'inline'
        ? [definition.rule]
        : context.ruleSources.find((source) => source.index === index)?.lines;

    if (!Number.isSafeInteger(definition.interval) || definition.interval < 0) {
      fail('rule', index, 'interval', 'invalid-rule-interval');
    }

    if (/[\r\n\0,]/.test(policy)) {
      fail('rule', index, 'policy', 'invalid-rule-policy-name');
    }

    if (!lines) {
      return fail('rule', index, 'url', 'rule-source-not-materialized');
    }

    for (const line of lines) {
      if (terminated) {
        fail('rule', index, 'rule', 'rule-after-terminal');
      }

      const condition = parseCondition(line, index, definition.type === 'remote');

      if (definition.type === 'remote' && definition.noResolve) {
        condition.noResolve = true;
      }

      result.push({ condition, policy, index });
      terminated = condition.type === 'MATCH';
    }
  });

  return result;
}

function readPayload(
  content: string,
  definition: Extract<RuleSetConfigFields, { type: 'remote' }>,
  index: number,
): string[] {
  if (definition.resourceFormat === 'mrs') {
    return fail('rule', index, 'resourceFormat', 'binary-source-requires-native-provider');
  }

  let lines: string[];

  if (definition.format.startsWith('clash-') && definition.resourceFormat !== 'text') {
    const parsed: unknown = parseYaml(content, { uniqueKeys: true, maxAliasCount: 100 });

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('payload' in parsed) ||
      !Array.isArray(parsed.payload) ||
      !parsed.payload.every((item: unknown) => typeof item === 'string')
    ) {
      return fail('rule', index, 'url', 'invalid-rule-payload');
    }

    lines = parsed.payload;
  } else {
    lines = content.replace(/^\uFEFF/, '').split(/\r?\n/);
  }

  return lines
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && !line.startsWith(';') && !line.startsWith('//'))
    .map((line) => {
      if (definition.format === 'clash-domain') {
        if (line.startsWith('+.')) {
          return `DOMAIN-SUFFIX,${line.slice(2)}`;
        }

        if (line.startsWith('.')) {
          return `DOMAIN-SUFFIX,${line.slice(1)}`;
        }

        if (line.includes('*')) {
          return fail('rule', index, 'payload', 'unsupported-domain-wildcard');
        }

        return `DOMAIN,${line}`;
      }

      if (definition.format === 'clash-ipcidr') {
        return `${line.includes(':') ? 'IP-CIDR6' : 'IP-CIDR'},${line}`;
      }

      return line;
    });
}

export function nativeRuleProvider(target: OutputTarget, rule: RuleSetConfigFields): boolean {
  return (
    (target === 'clash' || target === 'stash') &&
    rule.type === 'remote' &&
    rule.format.startsWith('clash-') &&
    !rule.noResolve
  );
}

export async function materializeRules(
  rules: readonly RuleSetConfigFields[],
  target: OutputTarget,
  signal: AbortSignal,
): Promise<MaterializedRuleSource[]> {
  const cache = new Map<string, string>();
  const sources: MaterializedRuleSource[] = [];

  for (const [index, definition] of rules.entries()) {
    signal.throwIfAborted();
    if (definition.type === 'inline' || nativeRuleProvider(target, definition)) {
      continue;
    }

    if (definition.resourceFormat === 'mrs') {
      return fail('rule', index, 'resourceFormat', 'binary-source-requires-native-provider');
    }

    let url: URL;

    try {
      url = new URL(definition.url);
    } catch {
      return fail('rule', index, 'url', 'invalid-rule-url');
    }
    if (!['http:', 'https:'].includes(url.protocol)) {
      return fail('rule', index, 'url', 'unsupported-rule-url');
    }

    let content = cache.get(definition.url);

    if (content === undefined) {
      try {
        const response = await fetch(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(30000)]) });

        if (!response.ok) {
          return fail('rule', index, 'url', 'rule-download-failed');
        }

        content = await response.text();
        cache.set(definition.url, content);
      } catch {
        signal.throwIfAborted();

        return fail('rule', index, 'url', 'rule-download-failed');
      }
    }

    try {
      sources.push({ index, lines: readPayload(content, definition, index) });
    } catch (error) {
      if (error instanceof Error && error.name === 'YAMLParseError') {
        return fail('rule', index, 'url', 'invalid-rule-payload');
      }

      throw error;
    }
  }

  return sources;
}

export function validateRule(
  condition: RuleCondition,
  allowed: readonly string[],
  index: number,
  noResolve = false,
): void {
  if (!allowed.includes(condition.type) || (condition.noResolve && !noResolve)) {
    fail('rule', index, 'rule', 'unsupported-rule-or-option');
  }

  if (condition.noResolve && !['IP-CIDR', 'IP-CIDR6', 'GEOIP'].includes(condition.type)) {
    fail('rule', index, 'noResolve', 'unsupported-no-resolve-condition');
  }

  condition.children?.forEach((child) => validateRule(child, allowed, index, noResolve));
}
