import { resolveDeclaration } from './shared';
import type { RulesetResolverModule } from './types';
import { parseRule } from '../rule';

const ruleFlags = new Set(['no-resolve', 'force-cellular', 'multi-interface', 'multi-interface-balance']);

export function normalizeQuanxRuleFlag(input: string): string | undefined {
  const value = input.trim();

  if (ruleFlags.has(value.toLowerCase())) {
    return value.toLowerCase();
  }

  const match = /^via-interface\s*=\s*(\S+)$/i.exec(value);

  return match ? `via-interface=${match[1]}` : undefined;
}

const aliases: Record<string, string> = {
  HOST: 'DOMAIN',
  'HOST-SUFFIX': 'DOMAIN-SUFFIX',
  'HOST-KEYWORD': 'DOMAIN-KEYWORD',
  'HOST-WILDCARD': 'DOMAIN-WILDCARD',
  'IP6-CIDR': 'IP-CIDR6',
};

const parse: RulesetResolverModule['parse'] = (input) => {
  const separator = input.indexOf(',');
  const type = input
    .slice(0, separator < 0 ? input.length : separator)
    .trim()
    .toUpperCase();
  const normalized = (aliases[type] ?? type) + (separator < 0 ? '' : input.slice(separator));

  return parseRule(normalized, { hasPolicy: true, normalizeFlag: normalizeQuanxRuleFlag });
};

export const quanxResolver: RulesetResolverModule = {
  category: 'quanx',
  payload: false,
  parse,
  parseInline: (input) => parseRule(input, { normalizeFlag: normalizeQuanxRuleFlag }),
  resolve: (declaration) => resolveDeclaration(declaration, quanxResolver),
};
