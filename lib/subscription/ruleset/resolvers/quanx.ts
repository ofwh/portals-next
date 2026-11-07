import { resolveDeclaration } from './shared';
import type { RulesetResolverModule } from './types';
import { parseCommonRule, parseRule } from '../rule';

const aliases: Record<string, string> = {
  HOST: 'DOMAIN',
  'HOST-SUFFIX': 'DOMAIN-SUFFIX',
  'HOST-KEYWORD': 'DOMAIN-KEYWORD',
  'IP6-CIDR': 'IP-CIDR6',
};

const parse: RulesetResolverModule['parse'] = (input) => {
  const separator = input.indexOf(',');
  const type = input
    .slice(0, separator < 0 ? input.length : separator)
    .trim()
    .toUpperCase();
  const normalized = (aliases[type] ?? type) + (separator < 0 ? '' : input.slice(separator));

  return parseRule(normalized, { hasPolicy: true });
};

export const quanxResolver: RulesetResolverModule = {
  category: 'quanx',
  payload: false,
  parse,
  parseInline: parseCommonRule,
  resolve: (declaration) => resolveDeclaration(declaration, quanxResolver),
};
