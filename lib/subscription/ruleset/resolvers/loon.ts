import { resolveDeclaration } from './shared';
import type { RulesetResolverModule } from './types';
import { parseCommonRule } from '../rule';

export const loonResolver: RulesetResolverModule = {
  category: 'loon',
  payload: false,
  parse: parseCommonRule,
  parseInline: parseCommonRule,
  resolve: (declaration) => resolveDeclaration(declaration, loonResolver),
};
