import { booleanOption, resolveTestGroup } from './shared';
import type { GroupCategoryResolver } from './types';
import { POLICY_ERROR_CODES } from '../../shared/errors';
import { EntryError } from '../diagnostics';

export const loadBalanceResolver: GroupCategoryResolver = {
  kind: 'load-balance',
  resolve(declaration) {
    const strategy = declaration.fields.strategy;

    if (strategy !== undefined && strategy !== '' && strategy !== 'consistent-hashing' && strategy !== 'round-robin') {
      throw new EntryError(POLICY_ERROR_CODES.INVALID_POLICY_OPTIONS, 'strategy');
    }

    const persistent = booleanOption(declaration, 'persistent');

    return {
      ...resolveTestGroup(declaration, false),
      strategy: strategy === 'round-robin' ? 'round-robin' : 'consistent-hashing',
      ...(persistent !== undefined ? { persistent } : {}),
    };
  },
};
