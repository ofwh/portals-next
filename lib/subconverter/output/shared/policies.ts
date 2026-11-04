import type { PolicyConfigFields } from '@/lib/workflow/nodes/configuration/nodes/policies/model/types';
import { fail } from './errors';
import type { ProxyNodeFields } from '../../types/proxy-node';
import type { ConvertedNodes, SymbolBinding } from '../types';

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
    return fail(stage, index, 'reference', 'missing-or-ambiguous-reference');
  }

  return matches[0].outputName;
}

function matcher(selector: string, index: number): (node: ProxyNodeFields) => boolean {
  if (!selector.startsWith('!!')) {
    if (selector.startsWith('script:')) {
      return fail('policy', index, 'members', 'selector-requires-unavailable-context');
    }

    try {
      const pattern = new RegExp(selector);

      return (node) => pattern.test(node.name);
    } catch {
      return fail('policy', index, 'members', 'invalid-selector');
    }
  }

  const special = /^!!(TYPE|SERVER|PORT)=(.+?)(?:!!(.*))?$/.exec(selector);

  if (!special) {
    return fail('policy', index, 'members', 'selector-requires-unavailable-context');
  }

  try {
    const name = new RegExp(special[3] ?? '');

    if (special[1] === 'PORT') {
      const ranges = special[2].split(',').map((part) => {
        const range = /^(!?)(\d+)(?:-(\d+))?$/.exec(part);

        if (!range) {
          return fail('policy', index, 'members', 'invalid-port-selector');
        }

        const start = Number(range[2]);
        const end = Number(range[3] ?? range[2]);

        if (start < 1 || end > 65535 || start > end) {
          return fail('policy', index, 'members', 'invalid-port-selector');
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
  } catch {
    return fail('policy', index, 'members', 'invalid-selector');
  }
}

export function resolvePolicies<N>(
  policies: readonly PolicyConfigFields[],
  nodes: ConvertedNodes<N>,
  existing: readonly SymbolBinding[],
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
      fail('assembly', -1, 'name', 'duplicate-or-empty-name');
    }

    names.add(symbol.inputName);
    outputs.add(symbol.outputName);
  }

  const entries = policies.map((definition, index) => {
    for (const field of ['interval', 'timeout', 'tolerance'] as const) {
      const value = definition[field];

      if (value !== undefined && (!Number.isSafeInteger(value) || value < 0)) {
        fail('policy', index, field, 'invalid-group-number');
      }
    }
    if (definition.url !== undefined) {
      try {
        if (!['http:', 'https:'].includes(new URL(definition.url).protocol)) {
          fail('policy', index, 'url', 'invalid-health-check-url');
        }
      } catch {
        fail('policy', index, 'url', 'invalid-health-check-url');
      }
    }

    if (
      ['url-test', 'fallback', 'load-balance'].includes(definition.type) &&
      (!definition.url || !definition.interval)
    ) {
      fail('policy', index, 'url/interval', 'missing-health-check-options');
    }

    if (definition.providers.length) {
      fail('policy', index, 'providers', 'provider-resource-not-supplied');
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
      fail('policy', index, 'members', 'empty-group');
    }

    return { definition, members: definition.type === 'relay' ? members : [...new Set(members)] };
  });
  const groups = new Map(entries.map((entry) => [entry.definition.name, entry]));
  const done = new Set<string>();
  const active = new Set<string>();
  const visit = (name: string) => {
    if (active.has(name)) {
      fail('policy', -1, 'members', 'cyclic-group-reference');
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
