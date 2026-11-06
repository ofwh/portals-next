import { parse as parseYaml } from 'yaml';
import logger from '@/lib/api/logger';
import { withRequestId } from '@/lib/api/request-context';
import type { RuleSetConfigFields } from '@/lib/subconverter/types/rulesets';
import { fail, OUTPUT_ERROR, OutputError } from './errors';
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
    logger.warn(OUTPUT_ERROR.INVALID_RULE_SYNTAX, { data: line, field: 'rule' });

    return fail('rule', index, 'rule', OUTPUT_ERROR.INVALID_RULE_SYNTAX);
  }
  if (/[\r\n\0]/.test(line)) {
    logger.warn(OUTPUT_ERROR.INVALID_RULE_LINE_BREAK, { data: line, field: 'rule' });

    return fail('rule', index, 'rule', OUTPUT_ERROR.INVALID_RULE_LINE_BREAK);
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
    logger.warn(OUTPUT_ERROR.INVALID_RULE_ARITY, { data: line, field: 'rule' });

    return fail('rule', index, 'rule', OUTPUT_ERROR.INVALID_RULE_ARITY);
  }

  if (terminal) {
    return { type, noResolve };
  }

  const value = fields[0];

  if (!value) {
    logger.warn(OUTPUT_ERROR.EMPTY_RULE_VALUE, { data: line, field: 'rule' });

    return fail('rule', index, 'rule', OUTPUT_ERROR.EMPTY_RULE_VALUE);
  }

  if (['AND', 'OR', 'NOT'].includes(type)) {
    if (!value.startsWith('(') || !value.endsWith(')')) {
      logger.warn(OUTPUT_ERROR.INVALID_LOGICAL_RULE, { data: line, field: 'rule' });

      return fail('rule', index, 'rule', OUTPUT_ERROR.INVALID_LOGICAL_RULE);
    }

    const children = splitFields(value.slice(1, -1)).map((part) => {
      if (!part.startsWith('(') || !part.endsWith(')')) {
        logger.warn(OUTPUT_ERROR.INVALID_LOGICAL_CONDITION, { data: part, field: 'rule' });

        return fail('rule', index, 'rule', OUTPUT_ERROR.INVALID_LOGICAL_CONDITION);
      }

      return parseCondition(part.slice(1, -1), index);
    });

    if (
      !children.length ||
      (type === 'NOT' && children.length !== 1) ||
      children.some((child) => child.type === 'MATCH')
    ) {
      logger.warn(OUTPUT_ERROR.INVALID_LOGICAL_OPERANDS, { data: line, field: 'rule' });

      return fail('rule', index, 'rule', OUTPUT_ERROR.INVALID_LOGICAL_OPERANDS);
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
      logger.warn(OUTPUT_ERROR.INVALID_RULE_INTERVAL, { data: definition, field: 'interval' });

      fail('rule', index, 'interval', OUTPUT_ERROR.INVALID_RULE_INTERVAL);
    }

    if (/[\r\n\0,]/.test(policy)) {
      logger.warn(OUTPUT_ERROR.INVALID_RULE_POLICY_NAME, { data: definition, field: 'policy' });

      fail('rule', index, 'policy', OUTPUT_ERROR.INVALID_RULE_POLICY_NAME);
    }

    if (!lines) {
      logger.warn(OUTPUT_ERROR.RULE_SOURCE_NOT_MATERIALIZED, { data: definition, field: 'url' });

      return fail('rule', index, 'url', OUTPUT_ERROR.RULE_SOURCE_NOT_MATERIALIZED);
    }

    for (const line of lines) {
      if (terminated) {
        logger.warn(OUTPUT_ERROR.RULE_AFTER_TERMINAL, { data: line, field: 'rule' });

        fail('rule', index, 'rule', OUTPUT_ERROR.RULE_AFTER_TERMINAL);
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
    logger.warn(OUTPUT_ERROR.BINARY_SOURCE_REQUIRES_NATIVE_PROVIDER, { data: definition, field: 'resourceFormat' });

    return fail('rule', index, 'resourceFormat', OUTPUT_ERROR.BINARY_SOURCE_REQUIRES_NATIVE_PROVIDER);
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
      logger.warn(OUTPUT_ERROR.INVALID_RULE_PAYLOAD, { data: definition, field: 'url' });

      return fail('rule', index, 'url', OUTPUT_ERROR.INVALID_RULE_PAYLOAD);
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
          logger.warn(OUTPUT_ERROR.UNSUPPORTED_DOMAIN_WILDCARD, { data: line, field: 'payload' });

          return fail('rule', index, 'payload', OUTPUT_ERROR.UNSUPPORTED_DOMAIN_WILDCARD);
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
      logger.warn(OUTPUT_ERROR.BINARY_SOURCE_REQUIRES_NATIVE_PROVIDER, { data: definition, field: 'resourceFormat' });

      return fail('rule', index, 'resourceFormat', OUTPUT_ERROR.BINARY_SOURCE_REQUIRES_NATIVE_PROVIDER);
    }

    let url: URL;

    try {
      url = new URL(definition.url);
    } catch {
      logger.warn(OUTPUT_ERROR.INVALID_RULE_URL, { data: definition, field: 'url' });

      return fail('rule', index, 'url', OUTPUT_ERROR.INVALID_RULE_URL);
    }
    if (!['http:', 'https:'].includes(url.protocol)) {
      logger.warn(OUTPUT_ERROR.UNSUPPORTED_RULE_URL, { data: definition, field: 'url' });

      return fail('rule', index, 'url', OUTPUT_ERROR.UNSUPPORTED_RULE_URL);
    }

    let content = cache.get(definition.url);

    if (content === undefined) {
      try {
        const response = await fetch(url, {
          headers: withRequestId(),
          signal: AbortSignal.any([signal, AbortSignal.timeout(30000)]),
        });

        if (!response.ok) {
          logger.warn(OUTPUT_ERROR.RULE_DOWNLOAD_FAILED, { data: definition, field: 'url' });

          return fail('rule', index, 'url', OUTPUT_ERROR.RULE_DOWNLOAD_FAILED);
        }

        content = await response.text();
        cache.set(definition.url, content);
      } catch (error) {
        signal.throwIfAborted();
        if (error instanceof OutputError) {
          throw error;
        }

        logger.warn(OUTPUT_ERROR.RULE_DOWNLOAD_FAILED, { data: definition, field: 'url' });

        return fail('rule', index, 'url', OUTPUT_ERROR.RULE_DOWNLOAD_FAILED);
      }
    }

    try {
      sources.push({ index, lines: readPayload(content, definition, index) });
    } catch (error) {
      if (error instanceof Error && error.name === 'YAMLParseError') {
        logger.warn(OUTPUT_ERROR.INVALID_RULE_PAYLOAD, { data: definition, field: 'url' });

        return fail('rule', index, 'url', OUTPUT_ERROR.INVALID_RULE_PAYLOAD);
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
    logger.warn(OUTPUT_ERROR.UNSUPPORTED_RULE_OR_OPTION, { data: condition, field: 'rule' });

    fail('rule', index, 'rule', OUTPUT_ERROR.UNSUPPORTED_RULE_OR_OPTION);
  }

  if (condition.noResolve && !['IP-CIDR', 'IP-CIDR6', 'GEOIP'].includes(condition.type)) {
    logger.warn(OUTPUT_ERROR.UNSUPPORTED_NO_RESOLVE_CONDITION, { data: condition, field: 'noResolve' });

    fail('rule', index, 'noResolve', OUTPUT_ERROR.UNSUPPORTED_NO_RESOLVE_CONDITION);
  }

  condition.children?.forEach((child) => validateRule(child, allowed, index, noResolve));
}
