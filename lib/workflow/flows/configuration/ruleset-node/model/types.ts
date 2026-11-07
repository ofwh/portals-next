import type { RuleCategory, RulesetTransformer } from '@/lib/subscription/types/ruleset';
import type { ConfigFormat } from '@/lib/subscription/types/shared';

export type RulesetResolveConfig = { format: ConfigFormat | '' } & (
  | { transformer: RulesetTransformer | ''; resolver?: never }
  | { resolver: RulesetTransformer | RuleCategory | '' | 'delimited' | 'structured'; transformer?: never }
);
