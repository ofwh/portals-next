import { parseDelimitedDeclaration, parseStructuredDeclaration } from './shared';
import { RULESET_ERROR_CODES } from '../../shared/errors';
import { isSingboxRemoteAddress } from '../../shared/ruleset';
import { isRecord, splitDelimited, textLimits, unquote } from '../../shared/text';
import type { RuleSetOptions } from '../../types/ruleset';
import type { ConfigFormat } from '../../types/shared';
import { EntryError } from '../diagnostics';
import type { RulesetDeclaration } from '../types';

function optionalText(value: unknown, field: string): string | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }

  if (typeof value !== 'string' || !value.trim() || value.length > textLimits.line) {
    throw new EntryError(RULESET_ERROR_CODES.INVALID_RULESET_OPTIONS, field);
  }

  return value.trim();
}

export function readSingboxDeclaration(input: unknown, format: ConfigFormat, id: string): RulesetDeclaration {
  let group: unknown;
  let source: unknown;
  let interval: unknown;
  let tag: unknown;
  let downloadDetour: unknown;
  let fields: string[] = [];

  if (format === 'ini' && typeof input === 'string') {
    const parts = splitDelimited(input, ',', false, 2);

    group = parts[0] === undefined ? undefined : unquote(parts[0]);
    fields = parts[1] === undefined ? [] : splitDelimited(parts[1]);
    source = fields[0] === undefined ? undefined : unquote(fields[0]);
    interval = fields[1] === undefined ? undefined : unquote(fields[1]);
    tag = fields[2] === undefined ? undefined : unquote(fields[2]);
    downloadDetour = fields[3] === undefined ? undefined : unquote(fields[3]);
  } else if (isRecord(input)) {
    group = input.group;
    source = input.ruleset;
    interval = input.interval;
    tag = input.tag;
    downloadDetour = input.download_detour;
  }

  const remote =
    typeof source === 'string' ? /^(singbox|singbox-source|singbox-binary):(.*)$/.exec(source.trim()) : null;

  if (!remote) {
    if (isRecord(input) && (input.tag !== undefined || input.download_detour !== undefined)) {
      throw new EntryError(RULESET_ERROR_CODES.INVALID_RULESET_OPTIONS);
    }

    return format === 'ini'
      ? parseDelimitedDeclaration(String(input), id)
      : parseStructuredDeclaration(input, format, id);
  }

  if (isRecord(input)) {
    if (Object.hasOwn(input, 'import')) {
      throw new EntryError(RULESET_ERROR_CODES.RULESET_IMPORT_FORBIDDEN, 'import');
    }

    if ((input.type !== undefined && input.type !== 'singbox') || input.rule !== undefined) {
      throw new EntryError(RULESET_ERROR_CODES.INVALID_RULESET_ENTRY, 'type');
    }

    if (input.options !== undefined && (!Array.isArray(input.options) || input.options.length !== 0)) {
      throw new EntryError(RULESET_ERROR_CODES.INVALID_RULESET_OPTIONS, 'options');
    }
  }

  if (fields.length > 4 || typeof group !== 'string' || group.length > textLimits.line) {
    throw new EntryError(RULESET_ERROR_CODES.INVALID_RULESET_ENTRY);
  }

  const options: RuleSetOptions = {};

  if (remote[1] !== 'singbox') {
    options.format = remote[1] === 'singbox-source' ? 'source' : 'binary';
  }

  const address = remote[2].trim();

  if (address.length > textLimits.line) {
    throw new EntryError(RULESET_ERROR_CODES.INPUT_TOO_LARGE);
  }

  if (!isSingboxRemoteAddress(address, options.format)) {
    throw new EntryError(RULESET_ERROR_CODES.INVALID_RULESET_ENTRY, 'ruleset');
  }

  let seconds: number | undefined;

  if (interval !== undefined && interval !== '') {
    if (typeof interval === 'number') {
      seconds = interval;
    } else if (typeof interval === 'string' && /^\d+$/.test(interval)) {
      seconds = Number(interval);
    } else {
      throw new EntryError(RULESET_ERROR_CODES.INVALID_RULESET_ENTRY, 'interval');
    }
  }

  if (seconds !== undefined && (!Number.isSafeInteger(seconds) || seconds <= 0)) {
    throw new EntryError(RULESET_ERROR_CODES.INVALID_RULESET_ENTRY, 'interval');
  }

  const parsedTag = optionalText(tag, 'tag');
  const parsedDetour = optionalText(downloadDetour, 'download_detour');

  if (parsedTag !== undefined) {
    options.tag = parsedTag;
  }

  if (parsedDetour !== undefined) {
    if (parsedDetour === 'REJECT') {
      throw new EntryError(RULESET_ERROR_CODES.INVALID_RULESET_OPTIONS, 'download_detour');
    }

    options.downloadDetour = parsedDetour;
  }

  return {
    id,
    group: group.trim(),
    category: 'singbox',
    source: { kind: 'resource', address },
    ...(seconds !== undefined ? { interval: seconds } : {}),
    options,
  };
}
