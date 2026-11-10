import type { Rule, RuleContentCategory, RuleSet } from '../../types/ruleset';
import type { RulesetDeclaration } from '../types';

export type RulesetResolverModule = {
  category: RuleContentCategory;
  payload: boolean;
  parse: (input: string) => Rule;
  parseInline: (input: string) => Rule;
  resolve: (declaration: RulesetDeclaration) => RuleSet;
};
