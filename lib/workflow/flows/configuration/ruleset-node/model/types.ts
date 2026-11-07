import type { RuleCategory, RulesetFormat, RulesetResolver } from '@/lib/subscription/types/ruleset';

export type RulesetResolveConfig = {
  format: RulesetFormat | '';
  resolver: RulesetResolver | RuleCategory | '' | 'delimited' | 'structured';
};
