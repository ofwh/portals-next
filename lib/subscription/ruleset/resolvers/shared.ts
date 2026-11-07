import type { RulesetResolverModule } from './types';
import { RULESET_ERROR_CODES } from '../../shared/errors';
import type { RuleSet } from '../../types/ruleset';
import { EntryError } from '../diagnostics';
import type { RulesetDeclaration } from '../types';

function resolveSource(source: RulesetDeclaration['source'], resolver: RulesetResolverModule): RuleSet['source'] {
  if (source.kind === 'resource') {
    return source;
  }

  try {
    return { kind: 'inline', rule: resolver.parseInline(source.content) };
  } catch (error) {
    if (error instanceof EntryError && error.code === RULESET_ERROR_CODES.INVALID_RULE) {
      throw new EntryError(RULESET_ERROR_CODES.RESOLVER_MISMATCH, 'rule');
    }

    throw error;
  }
}

export function resolveDeclaration(declaration: RulesetDeclaration, resolver: RulesetResolverModule): RuleSet[] {
  if (declaration.category !== undefined && declaration.category !== resolver.category) {
    throw new EntryError(RULESET_ERROR_CODES.RESOLVER_MISMATCH, 'category');
  }

  return [
    {
      ...declaration,
      category: resolver.category,
      source: resolveSource(declaration.source, resolver),
    },
  ];
}
