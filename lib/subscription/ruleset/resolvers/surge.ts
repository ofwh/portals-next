import { resolveDeclaration } from './shared';
import type { RulesetResolverModule, RulesetTypeResolver } from './types';
import { parseCommonRule } from '../rule';

const surgeModeResolver: RulesetResolverModule = {
  category: 'surge',
  payload: false,
  parse: parseCommonRule,
  parseInline: parseCommonRule,
  resolve: (declaration) => resolveDeclaration(declaration, surgeModeResolver),
};

export const surgeResolver: RulesetTypeResolver = {
  type: 'surge',
  modes: [surgeModeResolver],
  resolve: surgeModeResolver.resolve,
};
