import { parseDocument } from 'yaml';
import type { ClashConfig, ClashRuleProvider } from '../../types/clash';
import type { RuleSetEntry } from '../../types/ruleset';
import { format as formatText, parse as parseText } from '../text-ruleset';

export function resolve(config: ClashConfig): string[] {
  return (config.rules ?? []).flatMap((rule) => {
    const [kind, name, ...target] = rule.split(',');

    if (kind !== 'RULE-SET') {
      return [rule];
    }

    const provider = config['rule-providers']?.[name];

    if (!provider?.payload) {
      return [rule];
    }

    return provider.payload.map((value) => {
      if (provider.behavior === 'classical') {
        return [value, ...target].join(',');
      }

      if (provider.behavior === 'ipcidr') {
        return [value.includes(':') ? 'IP-CIDR6' : 'IP-CIDR', value, ...target].join(',');
      }

      return [value.startsWith('+.') ? 'DOMAIN-SUFFIX' : 'DOMAIN', value.replace(/^\+\./, ''), ...target].join(',');
    });
  });
}

export function parse(content: string, behavior: ClashRuleProvider['behavior'] = 'classical'): RuleSetEntry[] {
  const document = parseDocument(content, { uniqueKeys: true });

  if (document.errors.length) {
    throw new Error('Invalid Clash ruleset');
  }

  const value: unknown = document.toJS({ maxAliasCount: 20 });
  const payload = Array.isArray(value)
    ? value
    : value && typeof value === 'object' && 'payload' in value
      ? value.payload
      : undefined;

  if (!Array.isArray(payload) || !payload.every((item) => typeof item === 'string')) {
    throw new Error('Invalid Clash ruleset payload');
  }

  return parseText(
    resolve({ rules: ['RULE-SET,source'], 'rule-providers': { source: { type: 'inline', behavior, payload } } }),
  );
}

export function format(entries: RuleSetEntry[]): { payload: string[] } {
  return { payload: formatText(entries) };
}
