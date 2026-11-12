import { text } from './shared';
import type { GroupCategoryResolver } from './types';
import { POLICY_ERROR_CODES } from '../../shared/errors';
import { EntryError } from '../diagnostics';

export const remoteFilterResolver: GroupCategoryResolver = {
  kind: 'remote-filter',
  resolve(declaration) {
    if (declaration.rules.length !== 1 || declaration.providers.length || declaration.flags !== undefined) {
      throw new EntryError(POLICY_ERROR_CODES.INVALID_POLICY_ENTRY, 'rule');
    }

    const rule = declaration.rules[0];
    const offset = rule.indexOf('=');
    const mode = rule.slice(0, offset);

    if (offset < 0 || (mode !== 'NameKeyword' && mode !== 'NameRegex')) {
      throw new EntryError(POLICY_ERROR_CODES.INVALID_POLICY_OPTIONS, 'mode');
    }

    return {
      name: declaration.name,
      kind: 'remote-filter',
      selectors: [],
      providerRefs: [],
      remoteFilter: { mode, filterKey: text(rule.slice(offset + 1), 'filterKey') },
    };
  },
};
