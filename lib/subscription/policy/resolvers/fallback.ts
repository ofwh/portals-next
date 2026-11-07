import { booleanOption, resolveTestGroup } from './shared';
import type { GroupCategoryResolver } from './types';

export const fallbackResolver: GroupCategoryResolver = {
  kind: 'fallback',
  resolve(declaration) {
    const evaluateBeforeUse = booleanOption(declaration, 'evaluate-before-use');

    return {
      ...resolveTestGroup(declaration, false),
      ...(evaluateBeforeUse !== undefined ? { evaluateBeforeUse } : {}),
    };
  },
};
