import { EntryError } from './diagnostics';
import { RULESET_ERROR_CODES } from '../shared/errors';
import { splitDelimited, unquote } from '../shared/text';
import type { Rule } from '../types/ruleset';

const ruleTypes = new Set([
  'DOMAIN',
  'DOMAIN-SUFFIX',
  'DOMAIN-KEYWORD',
  'IP-CIDR',
  'IP-CIDR6',
  'SRC-IP-CIDR',
  'GEOIP',
  'MATCH',
  'FINAL',
  'SRC-PORT',
  'DST-PORT',
  'PROCESS-NAME',
  'DOMAIN-REGEX',
  'GEOSITE',
  'IP-SUFFIX',
  'IP-ASN',
  'SRC-GEOIP',
  'SRC-IP-ASN',
  'SRC-IP-SUFFIX',
  'IN-PORT',
  'IN-TYPE',
  'IN-USER',
  'IN-NAME',
  'PROCESS-PATH-REGEX',
  'PROCESS-PATH',
  'PROCESS-NAME-REGEX',
  'UID',
  'NETWORK',
  'DSCP',
  'SUB-RULE',
  'RULE-SET',
  'AND',
  'OR',
  'NOT',
  'USER-AGENT',
  'URL-REGEX',
  'DEST-PORT',
  'SRC-IP',
  'IP-VERSION',
  'INBOUND',
  'PROTOCOL',
  'PACKAGE-NAME',
  'PORT',
  'PORT-RANGE',
  'SRC-PORT-RANGE',
  'USER',
  'USER-ID',
]);
const flags = new Set(['no-resolve', 'extended-matching', 'pre-matching']);
const commentTypes = new Set([
  'DOMAIN',
  'DOMAIN-SUFFIX',
  'DOMAIN-KEYWORD',
  'IP-CIDR',
  'IP-CIDR6',
  'IP6-CIDR',
  'SRC-IP-CIDR',
  'SRC-IP',
  'IP-SUFFIX',
  'SRC-IP-SUFFIX',
  'GEOIP',
  'SRC-GEOIP',
  'GEOSITE',
  'IP-ASN',
  'SRC-IP-ASN',
  'SRC-PORT',
  'DST-PORT',
  'DEST-PORT',
  'IN-PORT',
  'PORT',
  'PORT-RANGE',
  'SRC-PORT-RANGE',
  'IP-VERSION',
  'NETWORK',
  'PROTOCOL',
  'DSCP',
  'UID',
  'USER-ID',
  'MATCH',
  'FINAL',
  'HOST',
  'HOST-SUFFIX',
  'HOST-KEYWORD',
]);

export function stripComment(input: string, rawValue = false): string {
  const line = input.trim();

  if (/^(?:#|;|\/\/)/.test(line)) {
    return '';
  }

  const type = line.split(',', 1)[0].trim().toUpperCase();

  if (!rawValue && !commentTypes.has(type)) {
    return line;
  }

  let quote = '';
  let escaped = false;

  for (let index = 0; index < line.length; index++) {
    const char = line[index];

    if (escaped) {
      escaped = false;
    } else if (char === '\\') {
      escaped = true;
    } else if (quote) {
      if (char === quote) {
        quote = '';
      }
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '/' && line[index + 1] === '/' && /\s/.test(line[index - 1] ?? '')) {
      return line.slice(0, index).trimEnd();
    }
  }

  return line;
}

type RuleParseOptions = { hasPolicy?: boolean };

function validateConditions(type: string, input: string): void {
  if (!input.startsWith('(') || !input.endsWith(')')) {
    throw new EntryError(RULESET_ERROR_CODES.INVALID_RULE);
  }

  const conditions = splitDelimited(input.slice(1, -1), ',', true);

  if ((type === 'NOT' && conditions.length !== 1) || (type !== 'NOT' && conditions.length < 2)) {
    throw new EntryError(RULESET_ERROR_CODES.INVALID_RULE);
  }

  for (const condition of conditions) {
    if (!condition.startsWith('(') || !condition.endsWith(')')) {
      throw new EntryError(RULESET_ERROR_CODES.INVALID_RULE);
    }

    parseRule(condition.slice(1, -1));
  }
}

export function parseCommonRule(input: string): Rule {
  return parseRule(input);
}

export function parseRule(input: string, options: RuleParseOptions = {}): Rule {
  const line = stripComment(input);
  const logical = /^(AND|OR|NOT|SUB-RULE)\s*,/i.test(line);
  const tokens = splitDelimited(line, ',', logical);
  const type = tokens.shift()?.toUpperCase() ?? '';

  if (!ruleTypes.has(type)) {
    throw new EntryError(RULESET_ERROR_CODES.INVALID_RULE);
  }

  const ruleFlags: string[] = [];
  const parameterCount = type === 'MATCH' || type === 'FINAL' ? 0 : type === 'SUB-RULE' ? 2 : 1;

  while (tokens.length > parameterCount && flags.has(tokens[tokens.length - 1].toLowerCase())) {
    const flag = tokens.pop()!.toLowerCase();

    ruleFlags.unshift(flag);
  }

  if (type === 'MATCH' || type === 'FINAL') {
    if (tokens.length > (options.hasPolicy ? 1 : 0)) {
      throw new EntryError(RULESET_ERROR_CODES.INVALID_RULE);
    }

    return { type, parameters: [], flags: ruleFlags };
  }

  if (options.hasPolicy && tokens.length > 1) {
    tokens.pop();
  }

  const commaValue = ['DOMAIN-REGEX', 'URL-REGEX', 'PROCESS-NAME-REGEX', 'PROCESS-PATH-REGEX'].includes(type);

  if (!options.hasPolicy && !commaValue) {
    const extraFlags = tokens.splice(parameterCount);

    if (extraFlags.some((value) => !value)) {
      throw new EntryError(RULESET_ERROR_CODES.INVALID_RULE);
    }

    ruleFlags.unshift(...extraFlags);
  }

  const parameters = (commaValue ? [tokens.join(',')] : tokens).map(unquote);

  if (!parameters.length || parameters.some((value) => !value)) {
    throw new EntryError(RULESET_ERROR_CODES.INVALID_RULE);
  }

  if (['AND', 'OR', 'NOT'].includes(type)) {
    if (parameters.length !== 1 || !parameters[0].startsWith('(')) {
      throw new EntryError(RULESET_ERROR_CODES.INVALID_RULE);
    }

    validateConditions(type, parameters[0]);
  } else if (type === 'SUB-RULE') {
    if (parameters.length !== 2) {
      throw new EntryError(RULESET_ERROR_CODES.INVALID_RULE);
    }

    const condition = parameters[0];

    if (!condition.startsWith('(') || !condition.endsWith(')')) {
      throw new EntryError(RULESET_ERROR_CODES.INVALID_RULE);
    }

    parseRule(condition.slice(1, -1));
  } else if (parameters.length !== 1) {
    throw new EntryError(RULESET_ERROR_CODES.INVALID_RULE);
  }

  return { type, parameters, flags: ruleFlags };
}
