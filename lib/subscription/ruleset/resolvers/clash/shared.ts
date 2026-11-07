import { isIP } from 'node:net';
import type { Rule } from '../../../types/ruleset';

export function parseClashPayloadValue(input: string): Rule | undefined {
  const value = input.trim();

  if (value.includes('/')) {
    const match = /^([^/]+)\/(\d+)$/.exec(value);
    const version = match ? isIP(match[1]) : 0;
    const prefix = match ? Number(match[2]) : -1;

    if (!version || prefix < 0 || prefix > (version === 4 ? 32 : 128)) {
      return undefined;
    }

    return { type: version === 4 ? 'IP-CIDR' : 'IP-CIDR6', parameters: [value], flags: [] };
  }

  let domain = value;
  let type = 'DOMAIN';

  if (domain.startsWith('.') || domain.startsWith('+.')) {
    type = 'DOMAIN-SUFFIX';
    domain = domain.slice(domain.startsWith('+.') ? 2 : 1);

    while (domain.endsWith('.*')) {
      type = 'DOMAIN-KEYWORD';
      domain = domain.slice(0, -2);
    }
  }

  if (!domain || /[\s,/:#;]/.test(domain) || domain.includes('*') || isIP(domain)) {
    return undefined;
  }

  return { type, parameters: [domain], flags: [] };
}
