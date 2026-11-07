import { clashClassicResolver } from './classic';
import { clashDomainResolver } from './domain';
import { clashIpcidrResolver } from './ipcidr';
import { RULESET_ERROR_CODES } from '../../../shared/errors';
import { EntryError } from '../../diagnostics';
import type { RulesetTypeResolver } from '../types';

export const clashResolver: RulesetTypeResolver = {
  type: 'clash',
  modes: [clashDomainResolver, clashIpcidrResolver, clashClassicResolver],
  resolve(declaration) {
    if (declaration.category === undefined) {
      throw new EntryError(RULESET_ERROR_CODES.MODE_REQUIRED, 'type');
    }

    const mode = clashResolver.modes.find((resolver) => resolver.category === declaration.category);

    if (!mode) {
      throw new EntryError(RULESET_ERROR_CODES.RESOLVER_MISMATCH, 'category');
    }

    return mode.resolve(declaration);
  },
};

export { clashClassicResolver, clashDomainResolver, clashIpcidrResolver };
