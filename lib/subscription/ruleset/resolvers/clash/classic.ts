import { parseCommonRule } from '../../rule';
import { resolveDeclaration } from '../shared';
import type { RulesetResolverModule } from '../types';

export const clashClassicResolver: RulesetResolverModule = {
  category: 'clash-classic',
  payload: true,
  parse: parseCommonRule,
  parseInline: parseCommonRule,
  resolve: (declaration) => resolveDeclaration(declaration, clashClassicResolver),
};
