import { DocumentError, parseStructuredDocument } from '../shared/document';
import { isRecord } from '../shared/text';
import type { SourcePosition } from '../types/diagnostic';
import type { ConfigFormat } from '../types/shared';

export type PolicyEntry = { value: unknown; position: SourcePosition };

function iniEntries(input: string): PolicyEntry[] {
  const entries: PolicyEntry[] = [];
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
    const position = { line: index + 1, column: raw.indexOf(line) + 1 };

    if (line.startsWith('[')) {
      const match = /^\[([^\]]+)\]\s*(?:[;#].*)?$/.exec(line);

      if (!match) {
        throw new DocumentError(position);
      }

      section = match[1].trim();
      hasCustom ||= section === 'custom';
      continue;
    }

    const field = /^([^=]+?)\s*=\s*(.*)$/.exec(line);
    const isImport = section === 'custom' && line.startsWith('!!import:');

    if ((field && !field[1].trim()) || (!field && !isImport)) {
      throw new DocumentError(position);
    }

    if (section !== 'custom') {
      continue;
    }

    customFields++;

    if (field?.[1].trim() === 'custom_proxy_group' || isImport) {
      entries.push({ value: isImport ? line : field![2], position });
    }
  }

  if ((hasContent && !hasCustom) || (customFields > 0 && entries.length === 0)) {
    throw new DocumentError();
  }

  return entries;
}

export function readPolicyEntries(input: string, format: ConfigFormat, legacyYaml = false): PolicyEntry[] {
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

  const key =
    legacyYaml && isRecord(root) && isRecord(root.custom) && root.custom.proxy_groups === undefined
      ? 'custom_proxy_group'
      : 'proxy_groups';
  const path = format === 'yaml' ? ['custom', key] : ['custom_groups'];
  let value: unknown;

  if (isRecord(root)) {
    if (format === 'yaml') {
      if (Object.keys(root).length > 0 && !isRecord(root.custom)) {
        throw new DocumentError(document.position(['custom']));
      }

      value = isRecord(root.custom) ? root.custom[key] : undefined;
    } else {
      value = root.custom_groups;
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
