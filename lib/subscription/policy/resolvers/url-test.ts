import { booleanOption, resolveTestGroup } from './shared';
import type { GroupCategoryResolver, GroupDeclaration } from './types';
import type { ProxyGroup } from '../../types/policy';

export function resolveLatencyGroup(declaration: GroupDeclaration): ProxyGroup {
  const lazy = booleanOption(declaration, 'lazy');
  const evaluateBeforeUse = booleanOption(declaration, 'evaluate-before-use');

  return {
    ...resolveTestGroup(declaration, true),
    ...(lazy !== undefined ? { lazy } : {}),
    ...(evaluateBeforeUse !== undefined ? { evaluateBeforeUse } : {}),
  };
}

export const urlTestResolver: GroupCategoryResolver = { kind: 'url-test', resolve: resolveLatencyGroup };
