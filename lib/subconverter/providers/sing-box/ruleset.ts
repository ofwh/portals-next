import type { RuleSetEntry } from '../../types/ruleset';
import type { SingBoxRule } from '../../types/sing-box';

const fields: Record<string, string> = {
  DOMAIN: 'domain',
  'DOMAIN-SUFFIX': 'domain_suffix',
  'DOMAIN-KEYWORD': 'domain_keyword',
  'DOMAIN-REGEX': 'domain_regex',
  'IP-CIDR': 'ip_cidr',
  'IP-CIDR6': 'ip_cidr',
  'SRC-IP-CIDR': 'source_ip_cidr',
  'RULE-SET': 'rule_set',
};

export function parse(content: string): RuleSetEntry[] {
  const value: unknown = JSON.parse(content);

  if (!value || typeof value !== 'object' || !('rules' in value) || !Array.isArray(value.rules)) {
    throw new Error('Invalid sing-box ruleset');
  }

  return value.rules.map((rule: unknown) => {
    if (!rule || typeof rule !== 'object' || Array.isArray(rule)) {
      throw new Error('Invalid sing-box rule');
    }

    const entries = Object.entries(rule);
    const matchers = entries.filter(([key]) => key !== 'outbound');

    if (matchers.length !== 1) {
      throw new Error('Combined sing-box rules are not supported by this ruleset converter');
    }

    const [key, values] = matchers[0];
    const type = Object.keys(fields).find((type) => fields[type] === key);

    if (!type || !Array.isArray(values) || !values.every((item) => typeof item === 'string')) {
      throw new Error('Unsupported sing-box rule');
    }

    const outbound = entries.find(([key]) => key === 'outbound')?.[1];

    if (outbound !== undefined && typeof outbound !== 'string') {
      throw new Error('Invalid rule outbound');
    }

    return { type, values, ...(outbound ? { outbound } : {}) };
  });
}

export function format(entries: RuleSetEntry[]): { version: 1; rules: SingBoxRule[] } {
  return {
    version: 1,
    rules: entries.map((entry) => {
      const field = fields[entry.type];

      if (!field || entry.options?.length) {
        throw new Error('Unsupported sing-box rule conversion');
      }

      return { [field]: entry.values, ...(entry.outbound ? { outbound: entry.outbound } : {}) };
    }),
  };
}
