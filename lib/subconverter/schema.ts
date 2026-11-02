import { debugNode, rejectNode } from './debug';

export type Reader<T> = (value: unknown) => T;
export type Parsed<R> = R extends Reader<infer T> ? T : never;

type Shape<S> = { [K in keyof S]: Reader<unknown> };
type NormalizeIp<S extends string> = S extends `${infer Head}IPv${infer Tail}`
  ? NormalizeIp<`${Head}Ipv${Tail}`>
  : S extends `${infer Head}IPs${infer Tail}`
    ? NormalizeIp<`${Head}Ips${Tail}`>
    : S;
type IsUpper<S extends string> = S extends Uppercase<S> ? (S extends Lowercase<S> ? false : true) : false;
type IsLower<S extends string> = S extends Lowercase<S> ? (S extends Uppercase<S> ? false : true) : false;
type First<S extends string> = S extends `${infer Head}${string}` ? Head : '';
type CamelCharacters<
  S extends string,
  Previous extends string = '',
  Result extends string = '',
  CapitalizeNext extends boolean = false,
> = S extends `${infer Char}${infer Rest}`
  ? Char extends '-' | '_'
    ? CamelCharacters<Rest, Char, Result, Result extends '' ? false : true>
    : CapitalizeNext extends true
      ? CamelCharacters<Rest, Char, `${Result}${Uppercase<Char>}`>
      : IsUpper<Char> extends true
        ? CamelCharacters<
            Rest,
            Char,
            `${Result}${Result extends ''
              ? Lowercase<Char>
              : IsLower<Previous> extends true
                ? Char
                : Previous extends `${number}`
                  ? Char
                  : IsUpper<Previous> extends true
                    ? IsLower<First<Rest>> extends true
                      ? Char
                      : Lowercase<Char>
                    : Lowercase<Char>}`
          >
        : CamelCharacters<Rest, Char, `${Result}${Char}`>
  : Result;
type CamelCase<S extends string> = CamelCharacters<NormalizeIp<S>>;
type ShapeValue<S extends Shape<S>> = {
  [K in keyof S as undefined extends Parsed<S[K]> ? never : CamelCase<K & string>]: Parsed<S[K]>;
} & {
  [K in keyof S as undefined extends Parsed<S[K]> ? CamelCase<K & string> : never]?: Parsed<S[K]>;
};

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
  return (value) => (value === undefined ? undefined : read(value));
}

export function array<T>(read: Reader<T>): Reader<T[]> {
  return (value) => {
    if (!Array.isArray(value)) {
      throw new Error('Expected an array');
    }

    return value.map(read);
  };
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
  return (value) => {
    try {
      return a(value);
    } catch {
      return b(value);
    }
  };
}

export function entries<T>(read: Reader<T>): Reader<{ name: string; value: T }[]> {
  return (value) => {
    if (Array.isArray(value)) {
      return value.map((item) => {
        const entry = object(item);

        if (Object.keys(entry).some((key) => key !== 'name' && key !== 'value')) {
          return rejectNode('unrepresentable-header');
        }

        return { name: text(field(entry, 'name')), value: read(field(entry, 'value')) };
      });
    }

    return Object.entries(object(value)).map(([name, item]: [string, unknown]) => ({ name, value: read(item) }));
  };
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
  return (value) => {
    const source = object(value);

    if (strict && Object.keys(source).some((key) => !Object.hasOwn(fields, key))) {
      return rejectNode('unrepresentable-parameter');
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
  };
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
  return (value) => {
    const tag = text(field(object(value), key));

    if (!Object.hasOwn(readers, tag)) {
      throw new Error('Unsupported configuration type');
    }

    return (field(readers, tag) as Reader<Parsed<S[keyof S]>>)(value);
  };
}

export function nodeItems<T>(read: Reader<T>, provider: string): Reader<T[]> {
  return (value) => {
    if (!Array.isArray(value)) {
      throw new Error('Expected a node array');
    }

    const result: T[] = [];

    for (const [index, item] of value.entries()) {
      try {
        result.push(read(item));
      } catch {
        debugNode(provider, 'parse', index, 'invalid-or-unsupported-node');
      }
    }

    return result;
  };
}

export function strictShape<S extends Shape<S>>(fields: S): Reader<ShapeValue<S>> {
  return shape(fields, true);
}
