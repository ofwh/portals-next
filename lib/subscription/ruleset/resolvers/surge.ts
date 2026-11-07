import { resolveDeclaration } from './shared';
import type { RulesetResolverModule } from './types';
import { parseCommonRule } from '../rule';

export const surgeResolver: RulesetResolverModule = {
  category: 'surge',
  payload: false,
  parse: parseCommonRule,
  parseInline: parseCommonRule,
  resolve: (declaration) => resolveDeclaration(declaration, surgeResolver),
};
