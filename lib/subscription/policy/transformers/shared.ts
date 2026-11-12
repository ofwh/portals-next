import type { PolicyTransformerModule } from './types';
import { POLICY_ERROR_CODES } from '../../shared/errors';
import { readGroupDeclaration } from '../declarations/shared';
import { readSurgePolicyPath } from '../declarations/surge';
import { EntryError } from '../diagnostics';

export function defineTransformer(options: Omit<PolicyTransformerModule, 'transform'>): PolicyTransformerModule {
  return {
    ...options,
    transform(input, format) {
      const declaration = readGroupDeclaration(input, format);
      const resolver = options.resolvers.find((resolver) => resolver.kind === declaration.kind);

      if (!resolver) {
        throw new EntryError(POLICY_ERROR_CODES.POLICY_TRANSFORMER_MISMATCH, 'type');
      }

      return resolver.resolve(options.type === 'surge' ? readSurgePolicyPath(declaration) : declaration);
    },
  };
}
