import { clashResolver } from './clash';
import { quanxResolver } from './quanx';
import { surgeResolver } from './surge';
import type { RulesetResolverModule, RulesetTypeResolver } from './types';
import { RULESET_ERROR_CODES } from '../../shared/errors';
import { ruleCategoryResolvers } from '../../shared/ruleset';
import type { RuleCategory, RulesetResolver } from '../../types/ruleset';
import { EntryError } from '../diagnostics';

export const rulesetResolvers: Record<RulesetResolver, RulesetTypeResolver> = {
  surge: surgeResolver,
  quanx: quanxResolver,
  clash: clashResolver,
};

export function getRulesetMode(category: RuleCategory): RulesetResolverModule {
  const resolver = rulesetResolvers[ruleCategoryResolvers[category]];
  const mode = resolver.modes.find((mode) => mode.category === category);

  if (!mode) {
    throw new EntryError(RULESET_ERROR_CODES.INVALID_CATEGORY, 'category');
  }

  return mode;
}

export { clashResolver, quanxResolver, surgeResolver };
