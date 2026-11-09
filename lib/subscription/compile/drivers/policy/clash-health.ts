import type { TemplateValue } from '../../../types/template';
import type { TargetObject } from '../../types';
import { object } from '../shared';

function mapping(value: TemplateValue, depth = 0): TargetObject | undefined {
  if (!object(value) || depth >= 32) {
    return;
  }

  const result: TargetObject = {};

  for (const [key, child] of Object.entries(value)) {
    if (key !== '<<') {
      Object.defineProperty(result, key, { value: child, writable: true, enumerable: true, configurable: true });
    }
  }
  if (Object.hasOwn(value, '<<')) {
    const merged = value['<<'];

    for (const source of Array.isArray(merged) ? merged : [merged]) {
      const base = mapping(source, depth + 1);

      if (!base) {
        return;
      }

      for (const [key, child] of Object.entries(base)) {
        if (!Object.hasOwn(result, key)) {
          Object.defineProperty(result, key, { value: child, writable: true, enumerable: true, configurable: true });
        }
      }
    }
  }

  return result;
}

function integer(value: string): number | undefined {
  const text = value.replaceAll('_', '');

  if (!/^[+-]?(?:0x[\da-f]+|0o[0-7]+|0b[01]+|\d+)$/i.test(text)) {
    return;
  }

  const negative = text.startsWith('-');
  const digits = text.replace(/^[+-]/, '');
  const parsed = /^0[0-7]+$/.test(digits) ? parseInt(digits, 8) : Number(digits);

  return Number.isSafeInteger(parsed) ? (negative ? -parsed : parsed) : undefined;
}

function expected(value: TemplateValue): TemplateValue | undefined {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value >= 0 ? value : undefined;
  }

  if (typeof value !== 'string') {
    return;
  }

  const text = value.trim();

  if (text === '' || text === '*') {
    return value;
  }

  const terms = text.split(/[,/]/);

  if (
    terms.length > 28 ||
    terms.some((term) => term.trim() && !/^\[? *\d+ *\]?(?:-\[? *\d+ *\]?)?$/.test(term.trim()))
  ) {
    return;
  }

  return /^\d+$/.test(text) && Number.isSafeInteger(Number(text))
    ? Number(text)
    : value.replace(/[\u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]/g, ' ');
}

export function inheritClashHealth(output: TargetObject, original: TemplateValue | undefined): void {
  if (!Array.isArray(original)) {
    return;
  }

  const candidates = original.map((item) => mapping(item)).filter((item) => item?.name === output.name);

  if (candidates.length !== 1 || !candidates[0] || candidates[0].type !== output.type) {
    return;
  }

  const base = candidates[0];

  for (const key of ['expected-status', 'timeout', 'lazy']) {
    const value = base[key];

    if (output[key] !== undefined || value === undefined || value === null) {
      continue;
    }

    let inherited: TemplateValue | undefined;

    if (key === 'expected-status') {
      inherited = expected(value);
    } else if (key === 'lazy') {
      inherited =
        typeof value === 'boolean'
          ? value
          : typeof value === 'number' && Number.isInteger(value)
            ? value !== 0
            : undefined;
    } else {
      const number =
        typeof value === 'number' ? Math.trunc(value) : typeof value === 'string' ? integer(value) : undefined;

      if (number !== undefined && number >= 0 && number <= 2147483647) {
        inherited = number;
      }
    }

    if (inherited !== undefined) {
      output[key] = inherited;
    }
  }
}
