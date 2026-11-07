import { diagnostic, EntryError } from './diagnostics';
import { type PolicyEntry, readPolicyEntries } from './readers';
import { isPolicyTransformer, policyTransformers } from './transformers';
import { isConfigFormat } from '../shared/config';
import { DocumentError } from '../shared/document';
import { POLICY_ERROR_CODES } from '../shared/errors';
import { sourceLine, textLimits } from '../shared/text';
import type { ParseResult, PolicyDiagnostic } from '../types/diagnostic';
import type { PolicyTransformer, ProxyGroup } from '../types/policy';
import type { ConfigFormat } from '../types/shared';

export type PolicyParseOptions = { format: ConfigFormat; transformer: PolicyTransformer };

function parse(
  input: string,
  options: PolicyParseOptions,
  legacyYaml: boolean,
): ParseResult<ProxyGroup, PolicyDiagnostic> {
  const { format, transformer } = options;

  if (!isConfigFormat(format)) {
    return { ok: false, error: diagnostic(format, POLICY_ERROR_CODES.INVALID_FORMAT) };
  }

  if (!isPolicyTransformer(transformer)) {
    return { ok: false, error: diagnostic(format, POLICY_ERROR_CODES.INVALID_POLICY_TRANSFORMER) };
  }

  if (
    input.length > textLimits.length ||
    input.split(/\r\n|\n|\r/, textLimits.entries + 1).length > textLimits.entries
  ) {
    return { ok: false, error: diagnostic(format, POLICY_ERROR_CODES.INPUT_TOO_LARGE) };
  }

  let entries: PolicyEntry[];

  try {
    entries = readPolicyEntries(input, format, legacyYaml);
  } catch (error) {
    const position = error instanceof DocumentError ? error.position : undefined;

    return {
      ok: false,
      error: {
        ...diagnostic(format, POLICY_ERROR_CODES.INVALID_DOCUMENT, position),
        text: sourceLine(input, position?.line ?? 1),
      },
    };
  }
  if (entries.length > textLimits.entries) {
    return { ok: false, error: diagnostic(format, POLICY_ERROR_CODES.INPUT_TOO_LARGE) };
  }

  const items: ProxyGroup[] = [];
  const diagnostics: PolicyDiagnostic[] = [];

  for (const [index, entry] of entries.entries()) {
    try {
      if (typeof entry.value === 'string' && entry.value.length > textLimits.line) {
        throw new EntryError(POLICY_ERROR_CODES.INPUT_TOO_LARGE);
      }

      items.push(policyTransformers[transformer].transform(entry.value, format));
    } catch (error) {
      const issue = diagnostic(
        format,
        error instanceof EntryError ? error.code : POLICY_ERROR_CODES.INVALID_POLICY_ENTRY,
        { ...entry.position, index },
        error instanceof EntryError ? error.field : undefined,
      );

      issue.text = typeof entry.value === 'string' ? entry.value : JSON.stringify(entry.value);

      if (issue.code === POLICY_ERROR_CODES.POLICY_TRANSFORMER_MISMATCH) {
        issue.severity = 'warning';
      }

      diagnostics.push(issue);
    }
  }

  return { ok: true, items, diagnostics };
}

export function parsePolicies(input: string, options: PolicyParseOptions): ParseResult<ProxyGroup, PolicyDiagnostic> {
  return parse(input, options, false);
}

export function parseLegacyPolicies(
  input: string,
  options: PolicyParseOptions,
): ParseResult<ProxyGroup, PolicyDiagnostic> {
  return parse(input, options, options.format === 'yaml');
}

export { groupCategoryResolvers } from './resolvers';
export { policyTransformers, policyTransformerOptions, isPolicyTransformer } from './transformers';
export type { GroupCategoryResolver } from './resolvers/types';
export type { PolicyTransformerModule } from './transformers/types';
export type { GroupHealthCheck, MemberSelector, PolicyTransformer, ProxyGroup, ProxyGroupKind } from '../types/policy';
export type { ConfigFormat } from '../types/shared';
export type { PolicyDiagnostic } from '../types/diagnostic';
