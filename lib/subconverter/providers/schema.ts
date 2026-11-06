import { NODE_ERROR, rejectNode } from '../proxy-node/errors';
import type { Parsed, Reader, Shape, ShapeValue } from '../types/providers/schema';

const nativeWriters = new WeakMap<Reader<unknown>, (value: unknown) => unknown>();

function writable<T>(read: Reader<T>, write: (value: T) => unknown): Reader<T> {
  nativeWriters.set(read, (value) => write(read(value)));

  return read;
}

export function toNative<T>(read: Reader<T>, value: T): unknown {
  return nativeWriters.get(read)?.(value) ?? read(value);
}

export function object(value: unknown): object {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Expected a configuration object');
  }

  return value;
}

export function text(value: unknown): string {
  if (typeof value !== 'string') {
    throw new Error('Expected a string');
  }

  return value;
}

export function number(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error('Expected a finite number');
  }

  return value;
}

export function boolean(value: unknown): boolean {
  if (typeof value !== 'boolean') {
    throw new Error('Expected a boolean');
  }

  return value;
}

export function optional<T>(read: Reader<T>): Reader<T | undefined> {
  return writable(
    (value) => (value === undefined ? undefined : read(value)),
    (value) => (value === undefined ? undefined : toNative(read, value)),
  );
}

export function array<T>(read: Reader<T>): Reader<T[]> {
  return writable(
    (value) => {
      if (!Array.isArray(value)) {
        throw new Error('Expected an array');
      }

      return value.map(read);
    },
    (values) => values.map((value) => toNative(read, value)),
  );
}

export function oneOf<const T extends readonly string[]>(...values: T): Reader<T[number]> {
  return (value) => {
    const result = text(value);

    if (!values.includes(result)) {
      throw new Error('Unsupported configuration type');
    }

    return result as T[number];
  };
}

export function union<A, B>(a: Reader<A>, b: Reader<B>): Reader<A | B> {
  return writable(
    (value) => {
      try {
        return a(value);
      } catch {
        return b(value);
      }
    },
    (value) => {
      try {
        return toNative(a, a(value));
      } catch {
        return toNative(b, b(value));
      }
    },
  );
}

export function entries<T>(read: Reader<T>): Reader<{ name: string; value: T }[]> {
  return writable(
    (value) => {
      if (Array.isArray(value)) {
        return value.map((item) => {
          const entry = object(item);

          if (Object.keys(entry).some((key) => key !== 'name' && key !== 'value')) {
            return rejectNode(NODE_ERROR.UNREPRESENTABLE_HEADER);
          }

          return { name: text(field(entry, 'name')), value: read(field(entry, 'value')) };
        });
      }

      return Object.entries(object(value)).map(([name, item]: [string, unknown]) => ({ name, value: read(item) }));
    },
    (values) => {
      if (new Set(values.map((entry) => entry.name)).size !== values.length) {
        throw new Error('Duplicate native header');
      }

      return Object.fromEntries(values.map((entry) => [entry.name, toNative(read, entry.value)]));
    },
  );
}

export function field(value: object, key: string): unknown {
  return Object.hasOwn(value, key) ? (Reflect.get(value, key) as unknown) : undefined;
}

export function camelCase(value: string): string {
  const source = value.replace(/IPv/g, 'Ipv').replace(/IPs/g, 'Ips');
  let result = '';
  let capitalize = false;

  for (let i = 0; i < source.length; i++) {
    const char = source[i];

    if (char === '-' || char === '_') {
      capitalize = result.length > 0;
      continue;
    }

    if (capitalize) {
      result += char.toUpperCase();
      capitalize = false;
      continue;
    }

    if (/[A-Z]/.test(char)) {
      const previous = source[i - 1] ?? '';
      const next = source[i + 1] ?? '';
      const wordStart = /[a-z0-9]/.test(previous) || (/[A-Z]/.test(previous) && /[a-z]/.test(next));

      result += result.length > 0 && wordStart ? char : char.toLowerCase();
    } else {
      result += char;
    }
  }

  return result;
}

export function camelObject(value: unknown): object {
  return Object.fromEntries(
    Object.entries(object(value)).map(([key, item]: [string, unknown]) => [camelCase(key), item]),
  );
}

export function shape<S extends Shape<S>>(fields: S, strict = false): Reader<ShapeValue<S>> {
  return writable(
    (value) => {
      const source = object(value);

      if (strict && Object.keys(source).some((key) => !Object.hasOwn(fields, key))) {
        return rejectNode(NODE_ERROR.UNREPRESENTABLE_PARAMETER);
      }

      const result = camelObject(source);

      for (const [key, candidate] of Object.entries(fields)) {
        const read = candidate as Reader<unknown>;
        const decoded = read(field(source, Object.hasOwn(source, key) ? key : camelCase(key)));

        if (decoded !== undefined) {
          Object.defineProperty(result, camelCase(key), {
            value: decoded,
            enumerable: true,
            configurable: true,
            writable: true,
          });
        }
      }

      return result as ShapeValue<S>;
    },
    (value) => {
      const keys = new Set(Object.keys(fields).map(camelCase));

      if (Object.keys(value).some((key) => !keys.has(key))) {
        throw new Error('Unrepresentable native field');
      }

      return Object.fromEntries(
        Object.entries(fields).flatMap(([key, read]) => {
          const item = field(value, camelCase(key));

          return item === undefined ? [] : [[key, toNative(read as Reader<unknown>, item)]];
        }),
      );
    },
  );
}

export const stringOrNumber = union(text, number);
export const port = (value: unknown): string | number => {
  const result = stringOrNumber(value);

  if (!/^\d+$/.test(String(result)) || Number(result) < 1 || Number(result) > 65535) {
    throw new Error('Invalid proxy port');
  }

  return result;
};

export function json(content: string): unknown {
  try {
    return JSON.parse(content.replace(/^\uFEFF/, '')) as unknown;
  } catch {
    throw new Error('Invalid JSON configuration');
  }
}

export function base64(content: string): string {
  const normalized = content.replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/');

  if (!normalized || !/^[A-Za-z0-9+/]*={0,2}$/.test(normalized) || normalized.replace(/=+$/, '').length % 4 === 1) {
    throw new Error('Invalid Base64 subscription');
  }

  const decoded = Buffer.from(normalized, 'base64');

  if (decoded.toString('base64').replace(/=+$/, '') !== normalized.replace(/=+$/, '')) {
    throw new Error('Invalid Base64 subscription');
  }

  return new TextDecoder('utf-8', { fatal: true }).decode(decoded);
}

export function tagged<S extends Shape<S>>(key: string, readers: S): Reader<Parsed<S[keyof S]>> {
  const select = (value: unknown): Reader<Parsed<S[keyof S]>> => {
    const tag = text(field(object(value), key));

    if (!Object.hasOwn(readers, tag)) {
      throw new Error('Unsupported configuration type');
    }

    return field(readers, tag) as Reader<Parsed<S[keyof S]>>;
  };

  return writable(
    (value) => select(value)(value),
    (value) => toNative(select(value), value),
  );
}

export function strictShape<S extends Shape<S>>(fields: S): Reader<ShapeValue<S>> {
  return shape(fields, true);
}
