export type Source = Record<string, unknown>;

export type FieldRule<T extends object = Source> = {
  kind: 'field';
  source: Extract<keyof T, string>;
  default?: unknown;
  when?: (value: unknown, source: Readonly<T>) => boolean;
  transform?: (value: unknown, source: Readonly<T>) => unknown;
};

export type ObjectRule<T extends object = Source> = {
  kind: 'object';
  fields: Schema<T>;
  when?: (source: Readonly<T>) => boolean;
};

export type ArrayRule<T extends object = Source> = {
  kind: 'array';
  source: Extract<keyof T, string>;
  items?: Schema;
  when?: (value: readonly unknown[], source: Readonly<T>) => boolean;
  transformItem?: (item: unknown, index: number, source: Readonly<T>) => unknown;
};

export type SchemaRule<T extends object = Source> =
  Extract<keyof T, string> | FieldRule<T> | ObjectRule<T> | ArrayRule<T>;
export type Schema<T extends object = Source> = Readonly<Record<string, SchemaRule<T>>>;
