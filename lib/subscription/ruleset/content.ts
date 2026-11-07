import { diagnostic, EntryError } from './diagnostics';
import { rulesetResolvers } from './resolvers';
import { stripComment } from './rule';
import { DocumentError, parseStructuredDocument } from '../shared/document';
import { RULESET_ERROR_CODES } from '../shared/errors';
import { isRuleCategory } from '../shared/ruleset';
import { isRecord, sourceLine, textLimits } from '../shared/text';
import type { Diagnostic, ParseResult, SourcePosition } from '../types/diagnostic';
import type { Rule, RuleCategory } from '../types/ruleset';

export type RuleContentOptions = { category: RuleCategory };
type ContentEntry = { value: unknown; position: SourcePosition };

export function parseRuleContent(input: string, options: RuleContentOptions): ParseResult<Rule> {
  const { category } = options;

  if (!isRuleCategory(category)) {
    return { ok: false, error: diagnostic(String(category), RULESET_ERROR_CODES.INVALID_RULESET_CATEGORY) };
  }

  const resolver = rulesetResolvers[category];
  const format = resolver.payload ? 'yaml' : 'text';

  if (input.length > textLimits.length) {
    return { ok: false, error: diagnostic(format, RULESET_ERROR_CODES.INPUT_TOO_LARGE) };
  }

  let entries: ContentEntry[];

  try {
    if (resolver.payload) {
      const document = parseStructuredDocument(input, 'yaml');

      if (!isRecord(document.value) || !Array.isArray(document.value.payload)) {
        throw new DocumentError(document.position(['payload']));
      }

      entries = document.value.payload.map((value: unknown, index: number) => ({
        value,
        position: document.position(['payload', index]),
      }));
    } else {
      const first = input.split(/\r\n|\n|\r/).find((line) => stripComment(line));

      if (first && /^(?:payload\s*:|---(?:\s|$)|\[|\{)/.test(first.trimStart())) {
        throw new DocumentError();
      }

      entries = input.split(/\r\n|\n|\r/, textLimits.entries + 1).map((value, index) => ({
        value,
        position: { line: index + 1, column: value.search(/\S/) + 1 || 1 },
      }));
    }
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

  const items: Rule[] = [];
  const diagnostics: Diagnostic[] = [];

  for (const [index, entry] of entries.entries()) {
    try {
      if (typeof entry.value !== 'string') {
        throw new EntryError(RULESET_ERROR_CODES.INVALID_RULESET_RULE);
      }

      if (entry.value.length > textLimits.line) {
        throw new EntryError(RULESET_ERROR_CODES.INPUT_TOO_LARGE);
      }

      const value = stripComment(entry.value, category === 'clash-domain' || category === 'clash-ipcidr');

      if (value) {
        items.push(resolver.parse(value));
      }
    } catch (error) {
      const issue = diagnostic(
        format,
        error instanceof EntryError ? error.code : RULESET_ERROR_CODES.INVALID_RULESET_RULE,
        {
          ...entry.position,
          index,
        },
      );

      issue.text = typeof entry.value === 'string' ? entry.value : JSON.stringify(entry.value);
      diagnostics.push(issue);
    }
  }

  return { ok: true, items, diagnostics };
}
