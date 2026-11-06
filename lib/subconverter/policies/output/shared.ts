import logger from '@/lib/api/logger';
import { fail, OUTPUT_ERROR, OutputError } from '@/lib/subconverter/output/shared/errors';
import type { ConvertedNodes, SymbolBinding } from '@/lib/subconverter/types/output';
import type { PolicyConfigFields } from '@/lib/subconverter/types/policies';
import type { ProxyNodeFields } from '@/lib/subconverter/types/proxy-node/index';

export interface ResolvedPolicy {
  definition: PolicyConfigFields;
  members: string[];
}

export function builtinSymbols(lowercase = false): SymbolBinding[] {
  return ['DIRECT', 'REJECT'].map((inputName) => ({
    kind: 'builtin',
    inputName,
    outputName: lowercase ? inputName.toLowerCase() : inputName,
  }));
}

export function resolveSymbol(
  symbols: readonly SymbolBinding[],
  name: string,
  stage: 'policy' | 'rule',
  index: number,
): string {
  const matches = symbols.filter((symbol) => symbol.inputName === name);

  if (matches.length !== 1) {
    logger.warn(OUTPUT_ERROR.MISSING_OR_AMBIGUOUS_REFERENCE, { data: name, field: 'reference' });

    return fail(stage, index, 'reference', OUTPUT_ERROR.MISSING_OR_AMBIGUOUS_REFERENCE);
  }

  return matches[0].outputName;
}

function matcher(selector: string, index: number): (node: ProxyNodeFields) => boolean {
  if (!selector.startsWith('!!')) {
    if (selector.startsWith('script:')) {
      logger.warn(OUTPUT_ERROR.SELECTOR_REQUIRES_UNAVAILABLE_CONTEXT, { data: selector, field: 'members' });

      return fail('policy', index, 'members', OUTPUT_ERROR.SELECTOR_REQUIRES_UNAVAILABLE_CONTEXT);
    }

    try {
      const pattern = new RegExp(selector);

      return (node) => pattern.test(node.name);
    } catch {
      logger.warn(OUTPUT_ERROR.INVALID_SELECTOR, { data: selector, field: 'members' });

      return fail('policy', index, 'members', OUTPUT_ERROR.INVALID_SELECTOR);
    }
  }

  const special = /^!!(TYPE|SERVER|PORT)=(.+?)(?:!!(.*))?$/.exec(selector);

  if (!special) {
    logger.warn(OUTPUT_ERROR.SELECTOR_REQUIRES_UNAVAILABLE_CONTEXT, { data: selector, field: 'members' });

    return fail('policy', index, 'members', OUTPUT_ERROR.SELECTOR_REQUIRES_UNAVAILABLE_CONTEXT);
  }

  try {
    const name = new RegExp(special[3] ?? '');

    if (special[1] === 'PORT') {
      const ranges = special[2].split(',').map((part) => {
        const range = /^(!?)(\d+)(?:-(\d+))?$/.exec(part);

        if (!range) {
          logger.warn(OUTPUT_ERROR.INVALID_PORT_SELECTOR, { data: part, field: 'members' });

          return fail('policy', index, 'members', OUTPUT_ERROR.INVALID_PORT_SELECTOR);
        }

        const start = Number(range[2]);
        const end = Number(range[3] ?? range[2]);

        if (start < 1 || end > 65535 || start > end) {
          logger.warn(OUTPUT_ERROR.INVALID_PORT_SELECTOR, { data: part, field: 'members' });

          return fail('policy', index, 'members', OUTPUT_ERROR.INVALID_PORT_SELECTOR);
        }

        return { exclude: range[1] === '!', start, end };
      });

      return (node) => {
        if (!('port' in node) || !name.test(node.name)) {
          return false;
        }

        const positive = ranges.filter((range) => !range.exclude);
        const matches = (range: (typeof ranges)[number]) => node.port >= range.start && node.port <= range.end;

        return (!positive.length || positive.some(matches)) && !ranges.filter((range) => range.exclude).some(matches);
      };
    }

    const pattern = new RegExp(special[1] === 'TYPE' ? `^(?:${special[2]})$` : special[2]);

    return (node) =>
      name.test(node.name) &&
      pattern.test(special[1] === 'TYPE' ? node.type.toUpperCase() : 'server' in node ? node.server : '');
  } catch (error) {
    if (error instanceof OutputError) {
      throw error;
    }

    logger.warn(OUTPUT_ERROR.INVALID_SELECTOR, { data: selector, field: 'members' });

    return fail('policy', index, 'members', OUTPUT_ERROR.INVALID_SELECTOR);
  }
}

export function resolvePolicies<N>(
  policies: readonly PolicyConfigFields[],
  nodes: ConvertedNodes<N>,
  existing: readonly SymbolBinding[],
  requireHealthCheckUrl = true,
): { entries: ResolvedPolicy[]; symbols: SymbolBinding[] } {
  const symbols: SymbolBinding[] = policies.map((policy) => ({
    kind: 'group',
    inputName: policy.name,
    outputName: policy.name,
  }));
  const all = [...existing, ...symbols];
  const names = new Set<string>();
  const outputs = new Set<string>();

  for (const symbol of all) {
    if (!symbol.inputName.trim() || names.has(symbol.inputName) || outputs.has(symbol.outputName)) {
      logger.warn(OUTPUT_ERROR.DUPLICATE_OR_EMPTY_NAME, { data: symbol, field: 'name' });

      fail('assembly', -1, 'name', OUTPUT_ERROR.DUPLICATE_OR_EMPTY_NAME);
    }

    names.add(symbol.inputName);
    outputs.add(symbol.outputName);
  }

  const entries = policies.map((definition, index) => {
    for (const field of ['interval', 'timeout', 'tolerance'] as const) {
      const value = definition[field];

      if (value !== undefined && (!Number.isSafeInteger(value) || value < 0)) {
        logger.warn(OUTPUT_ERROR.INVALID_GROUP_NUMBER, { data: definition, field: field });

        fail('policy', index, field, OUTPUT_ERROR.INVALID_GROUP_NUMBER);
      }
    }
    if (definition.url !== undefined) {
      let protocol: string;

      try {
        protocol = new URL(definition.url).protocol;
      } catch {
        logger.warn(OUTPUT_ERROR.INVALID_HEALTH_CHECK_URL, { data: definition, field: 'url' });

        fail('policy', index, 'url', OUTPUT_ERROR.INVALID_HEALTH_CHECK_URL);
      }

      if (!['http:', 'https:'].includes(protocol)) {
        logger.warn(OUTPUT_ERROR.INVALID_HEALTH_CHECK_URL, { data: definition.url, field: 'url' });

        fail('policy', index, 'url', OUTPUT_ERROR.INVALID_HEALTH_CHECK_URL);
      }
    }

    if (
      ['url-test', 'fallback', 'load-balance'].includes(definition.type) &&
      ((requireHealthCheckUrl && !definition.url) || !definition.interval)
    ) {
      logger.warn(OUTPUT_ERROR.MISSING_HEALTH_CHECK_OPTIONS, { data: definition, field: 'url/interval' });

      fail('policy', index, 'url/interval', OUTPUT_ERROR.MISSING_HEALTH_CHECK_OPTIONS);
    }

    if (definition.providers.length) {
      logger.warn(OUTPUT_ERROR.PROVIDER_RESOURCE_NOT_SUPPLIED, { data: definition, field: 'providers' });

      fail('policy', index, 'providers', OUTPUT_ERROR.PROVIDER_RESOURCE_NOT_SUPPLIED);
    }

    const members: string[] = [];

    for (const member of definition.members) {
      if (member.type === 'reference') {
        members.push(resolveSymbol(all, member.value, 'policy', index));
      } else {
        const matches = matcher(member.value, index);

        members.push(...nodes.entries.filter((entry) => matches(entry.fields)).map((entry) => entry.symbol.outputName));
      }
    }
    if (!members.length) {
      logger.warn(OUTPUT_ERROR.EMPTY_GROUP, { data: definition, field: 'members' });

      fail('policy', index, 'members', OUTPUT_ERROR.EMPTY_GROUP);
    }

    return { definition, members: definition.type === 'relay' ? members : [...new Set(members)] };
  });
  const groups = new Map(entries.map((entry) => [entry.definition.name, entry]));
  const done = new Set<string>();
  const active = new Set<string>();
  const visit = (name: string) => {
    if (active.has(name)) {
      logger.warn(OUTPUT_ERROR.CYCLIC_GROUP_REFERENCE, { data: groups.get(name)?.definition, field: 'members' });

      fail('policy', -1, 'members', OUTPUT_ERROR.CYCLIC_GROUP_REFERENCE);
    }

    if (done.has(name)) {
      return;
    }

    active.add(name);
    groups
      .get(name)
      ?.members.filter((member) => groups.has(member))
      .forEach(visit);
    active.delete(name);
    done.add(name);
  };

  groups.forEach((_, name) => visit(name));

  return { entries, symbols };
}
