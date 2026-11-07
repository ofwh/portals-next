import type { RulesetEntry } from './types';
import { DocumentError, parseStructuredDocument } from '../shared/document';
import { isRecord } from '../shared/text';
import type { ConfigFormat } from '../types/shared';

function iniEntries(input: string): RulesetEntry[] {
  const entries: RulesetEntry[] = [];
  let section = '';
  let hasCustom = false;
  let customFields = 0;
  let hasContent = false;

  for (const [index, raw] of input.split(/\r\n|\n|\r/).entries()) {
    const line = raw.trim();

    if (!line || /^(?:;|#|\/\/)/.test(line)) {
      continue;
    }

    hasContent = true;

    if (line.startsWith('[')) {
      const match = /^\[([^\]]+)\]\s*(?:[;#].*)?$/.exec(line);

      if (!match) {
        throw new DocumentError({ line: index + 1, column: raw.indexOf('[') + 1 });
      }

      section = match[1].trim();
      hasCustom ||= section === 'custom';
      continue;
    }

    const field = /^([^=]+?)\s*=\s*(.*)$/.exec(line);

    if ((field && !field[1].trim()) || (!field && !(section === 'custom' && line.startsWith('!!import:')))) {
      throw new DocumentError({ line: index + 1, column: raw.indexOf(line) + 1 });
    }

    if (section !== 'custom') {
      continue;
    }

    customFields++;
    const key = field?.[1].trim();

    if (key === 'ruleset' || line.startsWith('!!import:')) {
      entries.push({ value: field ? field[2] : line, position: { line: index + 1, column: raw.indexOf(line) + 1 } });
    }
  }

  if ((hasContent && !hasCustom) || (customFields > 0 && entries.length === 0)) {
    throw new DocumentError();
  }

  return entries;
}

export function readRulesetEntries(input: string, format: ConfigFormat): RulesetEntry[] {
  if (format === 'ini') {
    return iniEntries(input);
  }

  const document = parseStructuredDocument(input, format);
  const root = document.value;

  if (root !== null && !isRecord(root)) {
    throw new DocumentError();
  }

  if (
    root === null &&
    input.split(/\r\n|\n|\r/).some((line) => {
      const value = line.trim();

      return value && !value.startsWith('#') && !/^(?:---|\.\.\.)(?:\s+#.*)?$/.test(value);
    })
  ) {
    throw new DocumentError();
  }

  const path = format === 'yaml' ? ['custom', 'rulesets'] : ['rulesets'];
  let value: unknown;

  if (isRecord(root)) {
    if (format === 'yaml') {
      if (Object.keys(root).length > 0 && !isRecord(root.custom)) {
        throw new DocumentError(document.position(['custom']));
      }

      value = isRecord(root.custom) ? root.custom.rulesets : undefined;
    } else {
      value = root.rulesets;
    }

    if (Object.keys(root).length > 0 && value === undefined) {
      throw new DocumentError(document.position(path));
    }
  }

  if (value !== undefined && !Array.isArray(value)) {
    throw new DocumentError(document.position(path));
  }

  return (value ?? []).map((value: unknown, index: number) => ({
    value,
    position: document.position([...path, index]),
  }));
}
