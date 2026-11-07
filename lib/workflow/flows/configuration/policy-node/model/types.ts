import type { PolicyTransformer } from '@/lib/subscription/types/policy';
import type { ConfigFormat } from '@/lib/subscription/types/shared';

type PolicyFormatConfig = {
  format: ConfigFormat | '';
};

export type PolicyResolveConfig = PolicyFormatConfig &
  (
    | { transformer: PolicyTransformer | ''; resolver?: never }
    | { resolver: 'legacy-delimited' | 'legacy-object' | ''; transformer?: never }
  );
