import type { RuleSet, RulesetTransformer } from '../../types/ruleset';
import type { ConfigFormat } from '../../types/shared';
import type { RulesetResolverModule } from '../resolvers/types';

export type RulesetTransformerModule = {
  type: RulesetTransformer;
  label: string;
  resolvers: readonly RulesetResolverModule[];
  inlineResolver: RulesetResolverModule;
  transform: (input: unknown, format: ConfigFormat, id: string) => RuleSet;
};
