import type { RuleContentCategory, RulesetTransformer } from '../types/ruleset';

export const ruleCategoryTransformers = {
  surge: 'surge',
  quanx: 'quanx',
  'clash-domain': 'clash',
  'clash-ipcidr': 'clash',
  'clash-classic': 'clash',
} as const satisfies Record<RuleContentCategory, RulesetTransformer>;

export function isRuleCategory(value: unknown): value is RuleContentCategory {
  return typeof value === 'string' && Object.hasOwn(ruleCategoryTransformers, value);
}

export function isSingboxRemoteAddress(address: string, format?: 'source' | 'binary'): boolean {
  try {
    const url = new URL(address);

    return ['http:', 'https:'].includes(url.protocol) && (format !== undefined || /\.(json|srs)$/.test(url.pathname));
  } catch {
    return false;
  }
}
