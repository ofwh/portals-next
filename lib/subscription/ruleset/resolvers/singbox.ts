import { surgeResolver } from './surge';
import type { RulesetResolverModule } from './types';
import { RULESET_ERROR_CODES } from '../../shared/errors';
import { splitDelimited, unquote } from '../../shared/text';
import type { Rule, RuleSet } from '../../types/ruleset';
import { EntryError } from '../diagnostics';
import { parseCommonRule, stripComment } from '../rule';
import type { RulesetDeclaration } from '../types';

function parseInline(content: string): Rule {
  const tokens = splitDelimited(stripComment(content));
  const type = tokens[0].toUpperCase();
  const parameters = tokens.slice(1).map(unquote);

  if (type === 'RULE-SET') {
    if (!parameters.length || parameters.some((tag) => !tag.trim())) {
      throw new EntryError(RULESET_ERROR_CODES.INVALID_RULESET_RULE);
    }

    return { type, parameters, flags: [] };
  }

  if (type === 'PRIVATE') {
    if (parameters.length !== 1 || !['true', 'false'].includes(parameters[0])) {
      throw new EntryError(RULESET_ERROR_CODES.INVALID_RULESET_RULE);
    }

    return { type, parameters, flags: [] };
  }

  return parseCommonRule(content);
}

export const singboxInlineResolver: RulesetResolverModule = {
  ...surgeResolver,
  parseInline,
  resolve(declaration) {
    if (declaration.category === 'singbox' || declaration.source.kind !== 'inline') {
      throw new EntryError(RULESET_ERROR_CODES.INVALID_RULESET_ENTRY);
    }

    const content = declaration.source.content;
    const tokens = splitDelimited(stripComment(content));
    const type = tokens[0].toUpperCase();
    let rule: Rule;

    if (type === 'FINAL' || type === 'MATCH') {
      const parameters = tokens.slice(1).map(unquote);

      if (
        declaration.group === 'REJECT' ||
        parameters.length > 1 ||
        (parameters.length === 1 && parameters[0].trim() !== declaration.group)
      ) {
        throw new EntryError(RULESET_ERROR_CODES.INVALID_RULESET_RULE);
      }

      rule = { type, parameters: [], flags: [] };
    } else {
      rule = parseInline(content);
    }

    return { ...declaration, category: 'surge', source: { kind: 'inline', rule } };
  },
};

export function resolveSingboxRemote(declaration: RulesetDeclaration): RuleSet {
  if (declaration.category !== 'singbox' || declaration.source.kind !== 'resource') {
    throw new EntryError(RULESET_ERROR_CODES.INVALID_RULESET_ENTRY);
  }

  return { ...declaration, category: 'singbox', source: declaration.source };
}
