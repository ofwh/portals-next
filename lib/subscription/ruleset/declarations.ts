import { EntryError } from './diagnostics';
import type { RulesetDeclaration } from './types';
import { RULESET_ERROR_CODES } from '../shared/errors';
import { isRuleCategory } from '../shared/ruleset';
import { isRecord, splitDelimited, textLimits, unquote } from '../shared/text';
import type { RuleCategory, RuleSetOptions } from '../types/ruleset';

const tomlCategories: Record<string, RuleCategory> = {
  'surge-ruleset': 'surge',
  quantumultx: 'quanx',
  'clash-domain': 'clash-domain',
  'clash-ipcidr': 'clash-ipcidr',
  'clash-classic': 'clash-classic',
};

function parseOptions(input: unknown): RuleSetOptions {
  if (input === undefined) {
    return {};
  }

  if (!Array.isArray(input) || !input.every((value): value is string => typeof value === 'string')) {
    throw new EntryError(RULESET_ERROR_CODES.INVALID_OPTIONS, 'options');
  }

  const options: RuleSetOptions = {};

  for (const raw of input) {
    const option = raw.trim().toLowerCase();

    if (!option) {
      continue;
    }

    if (option === 'no-resolve') {
      options.noResolve = true;
    } else if (/^stash-format=(yaml|text|mrs)$/.test(option)) {
      const format = option.slice('stash-format='.length) as 'yaml' | 'text' | 'mrs';

      if (options.stashFormat && options.stashFormat !== format) {
        throw new EntryError(RULESET_ERROR_CODES.INVALID_OPTIONS, 'options');
      }

      options.stashFormat = format;
    } else {
      throw new EntryError(RULESET_ERROR_CODES.INVALID_OPTIONS, 'options');
    }
  }

  return options;
}

function intervalOptions(raw: unknown, options: unknown, legacy: boolean) {
  let interval = 86400;
  let suffix: string[] = [];

  if (raw !== undefined) {
    if (legacy && typeof raw === 'string') {
      const [value, ...rest] = splitDelimited(raw, '|');
      const match = /^\s*([+-]?\d+)/.exec(value);

      interval = match ? Number(match[1]) : 0;
      suffix = rest;
    } else if (typeof raw === 'number' && Number.isSafeInteger(raw)) {
      interval = raw;
    } else {
      throw new EntryError(RULESET_ERROR_CODES.INVALID_ENTRY, 'interval');
    }
  }

  if (!Number.isSafeInteger(interval)) {
    throw new EntryError(RULESET_ERROR_CODES.INVALID_ENTRY, 'interval');
  }

  const parsed = parseOptions(options);
  const combined = parseOptions([
    ...suffix,
    ...(parsed.noResolve ? ['no-resolve'] : []),
    ...(parsed.stashFormat ? [`stash-format=${parsed.stashFormat}`] : []),
  ]);

  return { interval, options: combined };
}

function makeDeclaration(
  group: unknown,
  rawSource: unknown,
  category: RuleCategory | undefined,
  id: string,
  interval: number,
  options: RuleSetOptions,
): RulesetDeclaration {
  if (typeof group !== 'string' || !group.trim() || typeof rawSource !== 'string' || !rawSource.trim()) {
    throw new EntryError(RULESET_ERROR_CODES.INVALID_ENTRY);
  }

  if (group.length > textLimits.line || rawSource.length > textLimits.line) {
    throw new EntryError(RULESET_ERROR_CODES.INPUT_TOO_LARGE);
  }

  let address = rawSource.trim();
  const separator = address.indexOf(':');
  const candidate = separator < 0 ? undefined : address.slice(0, separator);
  const prefix = isRuleCategory(candidate) ? candidate : undefined;

  if (prefix) {
    if (category !== undefined && category !== prefix) {
      throw new EntryError(RULESET_ERROR_CODES.RESOLVER_MISMATCH, 'category');
    }

    category = prefix;
    address = address.slice(prefix.length + 1);
  }

  if (/^(?:\[\])?!!import:/.test(address)) {
    throw new EntryError(RULESET_ERROR_CODES.IMPORT_FORBIDDEN);
  }

  if (!address.trim()) {
    throw new EntryError(RULESET_ERROR_CODES.INVALID_ENTRY, 'ruleset');
  }

  return {
    id,
    group: group.trim(),
    ...(category ? { category } : {}),
    interval,
    options,
    source: address.startsWith('[]') ? { kind: 'inline', content: address.slice(2) } : { kind: 'resource', address },
  };
}

export function parseDelimitedDeclaration(input: string, id: string): RulesetDeclaration {
  if (input.trim().startsWith('!!import:')) {
    throw new EntryError(RULESET_ERROR_CODES.IMPORT_FORBIDDEN);
  }

  const fields = splitDelimited(input, ',', false, 2);

  if (fields.length !== 2) {
    throw new EntryError(RULESET_ERROR_CODES.INVALID_ENTRY);
  }

  const group = unquote(fields[0]);
  const rest = fields[1];

  const separator = rest.indexOf(':');
  const typedInline =
    separator >= 0 && isRuleCategory(rest.slice(0, separator)) && rest.slice(separator + 1).startsWith('[]');

  if (rest.startsWith('[]') || typedInline) {
    return makeDeclaration(group, rest, undefined, id, 86400, {});
  }

  const sourceFields = splitDelimited(rest);
  const rawInterval = sourceFields.length > 1 ? sourceFields.pop() : undefined;
  const source = unquote(sourceFields.join(','));
  const { interval, options } = intervalOptions(rawInterval, undefined, true);

  return makeDeclaration(group, source, undefined, id, interval, options);
}

export function parseStructuredDeclaration(input: unknown, format: 'yaml' | 'toml', id: string): RulesetDeclaration {
  let category: RuleCategory | undefined;

  if (typeof input === 'string' && input.startsWith('!!import:')) {
    throw new EntryError(RULESET_ERROR_CODES.IMPORT_FORBIDDEN);
  }

  if (!isRecord(input)) {
    throw new EntryError(RULESET_ERROR_CODES.INVALID_ENTRY);
  }

  if (Object.hasOwn(input, 'import')) {
    throw new EntryError(RULESET_ERROR_CODES.IMPORT_FORBIDDEN, 'import');
  }

  if (format === 'toml' && input.type !== undefined) {
    if (typeof input.type !== 'string' || !Object.hasOwn(tomlCategories, input.type)) {
      throw new EntryError(RULESET_ERROR_CODES.INVALID_CATEGORY, 'type');
    }

    category = tomlCategories[input.type];
  }

  const rawInterval = format === 'yaml' && input.interval === '' ? undefined : input.interval;
  const { interval, options } = intervalOptions(rawInterval, input.options, format === 'yaml');
  const source =
    format === 'yaml' && !input.ruleset && typeof input.rule === 'string' ? `[]${input.rule}` : input.ruleset;

  return makeDeclaration(input.group, source, category, id, interval, options);
}
