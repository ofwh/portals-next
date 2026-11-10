import { diagnostic, EntryError } from './diagnostics';
import { readRulesetEntries } from './readers';
import { isRulesetTransformer, rulesetTransformers } from './transformers';
import type { RulesetEntry } from './types';
import { isConfigFormat } from '../shared/config';
import { DocumentError } from '../shared/document';
import { RULESET_ERROR_CODES } from '../shared/errors';
import { sourceLine, textLimits } from '../shared/text';
import type { Diagnostic, ParseResult } from '../types/diagnostic';
import type { RuleSet, RulesetTransformer } from '../types/ruleset';
import type { ConfigFormat } from '../types/shared';

export type RulesetParseOptions = {
  format: ConfigFormat;
  transformer: RulesetTransformer;
};

export function parseRulesets(input: string, options: RulesetParseOptions): ParseResult<RuleSet> {
  const { format, transformer } = options;

  if (!isConfigFormat(format)) {
    return { ok: false, error: diagnostic(format, RULESET_ERROR_CODES.INVALID_FORMAT) };
  }

  if (!isRulesetTransformer(transformer)) {
    return { ok: false, error: diagnostic(format, RULESET_ERROR_CODES.INVALID_RULESET_TRANSFORMER) };
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
    const position = error instanceof DocumentError ? error.position : undefined;

    return {
      ok: false,
      error: {
        ...diagnostic(format, RULESET_ERROR_CODES.INVALID_DOCUMENT, position),
        text: sourceLine(input, position?.line ?? 1),
      },
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

      const item = rulesetTransformers[transformer].transform(entry.value, format, `ruleset:${index}`);

      if (
        transformer === 'singbox' &&
        item.source.kind === 'inline' &&
        ['FINAL', 'MATCH'].includes(item.source.rule.type) &&
        index !== entries.length - 1
      ) {
        throw new EntryError(RULESET_ERROR_CODES.INVALID_RULESET_RULE);
      }

      items.push(item);
    } catch (error) {
      const issue = diagnostic(
        format,
        error instanceof EntryError ? error.code : RULESET_ERROR_CODES.INVALID_RULESET_ENTRY,
        position,
        error instanceof EntryError ? error.field : undefined,
      );

      issue.text = typeof entry.value === 'string' ? entry.value : JSON.stringify(entry.value);

      if (
        issue.code === RULESET_ERROR_CODES.RULESET_TRANSFORMER_MISMATCH ||
        issue.code === RULESET_ERROR_CODES.RULESET_RESOLVER_MISMATCH ||
        issue.code === RULESET_ERROR_CODES.INVALID_RULESET_CATEGORY
      ) {
        issue.severity = 'warning';
        issue.ruleset = issue.text;
      }

      diagnostics.push(issue);
    }
  }

  return { ok: true, items, diagnostics };
}

export { parseRuleContent } from './content';
export type { RuleContentOptions } from './content';
export { rulesetResolvers } from './resolvers';
export {
  rulesetTransformers,
  rulesetTransformerOptions,
  isRulesetTransformer,
  getRulesetTransformer,
} from './transformers';
export type { RulesetResolverModule } from './resolvers/types';
export type { RulesetTransformerModule } from './transformers/types';
export type { Diagnostic, ParseResult } from '../types/diagnostic';
export type { Rule, RuleCategory, RuleSet, RuleSetOptions, RulesetTransformer } from '../types/ruleset';
export type { ConfigFormat } from '../types/shared';
