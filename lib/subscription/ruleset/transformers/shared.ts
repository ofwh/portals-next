import { rulesetTransformerLabels } from './options';
import type { RulesetTransformerModule } from './types';
import { RULESET_ERROR_CODES } from '../../shared/errors';
import { parseDelimitedDeclaration, parseStructuredDeclaration } from '../declarations/shared';
import { EntryError } from '../diagnostics';

export function defineTransformer(
  options: Omit<RulesetTransformerModule, 'label' | 'transform'>,
): RulesetTransformerModule {
  return {
    ...options,
    label: rulesetTransformerLabels[options.type],
    transform(input, format, id) {
      const declaration =
        format === 'ini' ? parseDelimitedDeclaration(String(input), id) : parseStructuredDeclaration(input, format, id);

      if (declaration.source.kind === 'inline') {
        return options.inlineResolver.resolve({ ...declaration, category: undefined });
      }

      const defaultResolver = options.resolvers.length === 1 ? options.resolvers[0] : undefined;

      if (declaration.category === undefined && !defaultResolver) {
        throw new EntryError(RULESET_ERROR_CODES.RULESET_MODE_REQUIRED, 'type');
      }

      const resolver =
        declaration.category === undefined
          ? defaultResolver
          : options.resolvers.find((resolver) => resolver.category === declaration.category);

      if (!resolver) {
        throw new EntryError(RULESET_ERROR_CODES.RULESET_TRANSFORMER_MISMATCH, 'category');
      }

      return resolver.resolve(declaration);
    },
  };
}
