import { parseDelimitedDeclaration, parseStructuredDeclaration } from './declarations';
import { diagnostic, EntryError } from './diagnostics';
import { readRulesetEntries } from './readers';
import { rulesetResolvers } from './resolvers';
import type { RulesetEntry } from './types';
import { DocumentError } from '../shared/document';
import { RULESET_ERROR_CODES } from '../shared/errors';
import { isRulesetFormat, isRulesetResolver } from '../shared/ruleset';
import { textLimits } from '../shared/text';
import type { Diagnostic, ParseResult } from '../types/diagnostic';
import type { RuleSet, RulesetFormat, RulesetResolver } from '../types/ruleset';

export type RulesetParseOptions = {
  format: RulesetFormat;
  resolver: RulesetResolver;
};

export function parseRulesets(input: string, options: RulesetParseOptions): ParseResult<RuleSet> {
  const { format, resolver } = options;

  if (!isRulesetFormat(format)) {
    return { ok: false, error: diagnostic(format, RULESET_ERROR_CODES.INVALID_FORMAT) };
  }

  if (!isRulesetResolver(resolver)) {
    return { ok: false, error: diagnostic(format, RULESET_ERROR_CODES.INVALID_CATEGORY) };
  }

  if (
    input.length > textLimits.length ||
    input.split(/\r\n|\n|\r/, textLimits.entries + 1).length > textLimits.entries
  ) {
    return { ok: false, error: diagnostic(format, RULESET_ERROR_CODES.INPUT_TOO_LARGE) };
  }

  let entries: RulesetEntry[];

  try {
    entries = readRulesetEntries(input, format);
  } catch (error) {
    return {
      ok: false,
      error: diagnostic(
        format,
        RULESET_ERROR_CODES.INVALID_DOCUMENT,
        error instanceof DocumentError ? error.position : undefined,
      ),
    };
  }

  if (entries.length > textLimits.entries) {
    return { ok: false, error: diagnostic(format, RULESET_ERROR_CODES.INPUT_TOO_LARGE) };
  }

  const items: RuleSet[] = [];
  const diagnostics: Diagnostic[] = [];

  for (const [index, entry] of entries.entries()) {
    const position = { ...entry.position, index };

    try {
      if (typeof entry.value === 'string' && entry.value.length > textLimits.line) {
        throw new EntryError(RULESET_ERROR_CODES.INPUT_TOO_LARGE);
      }

      const id = `ruleset:${index}`;

      const declaration =
        format === 'ini'
          ? parseDelimitedDeclaration(String(entry.value), id)
          : parseStructuredDeclaration(entry.value, format, id);

      items.push(...rulesetResolvers[resolver].resolve(declaration));
    } catch (error) {
      const issue = diagnostic(
        format,
        error instanceof EntryError ? error.code : RULESET_ERROR_CODES.INVALID_ENTRY,
        position,
        error instanceof EntryError ? error.field : undefined,
      );

      if (issue.code === RULESET_ERROR_CODES.RESOLVER_MISMATCH || issue.code === RULESET_ERROR_CODES.INVALID_CATEGORY) {
        issue.severity = 'warning';
        issue.ruleset = typeof entry.value === 'string' ? entry.value : JSON.stringify(entry.value);
      }

      diagnostics.push(issue);
    }
  }

  return { ok: true, items, diagnostics };
}

export { parseRuleContent } from './content';
export type { RuleContentOptions } from './content';
export { clashResolver, quanxResolver, surgeResolver } from './resolvers';
export type { RulesetTypeResolver } from './resolvers/types';
export type { Diagnostic, ParseResult } from '../types/diagnostic';
export type { Rule, RuleCategory, RuleSet, RulesetFormat, RuleSetOptions, RulesetResolver } from '../types/ruleset';
