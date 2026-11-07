import type { PolicyTransformer, ProxyGroup } from '../../types/policy';
import type { ConfigFormat } from '../../types/shared';
import type { GroupCategoryResolver } from '../resolvers/types';

export type PolicyTransformerModule = {
  type: PolicyTransformer;
  label: string;
  resolvers: readonly GroupCategoryResolver[];
  transform: (input: unknown, format: ConfigFormat) => ProxyGroup;
};
