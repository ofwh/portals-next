import type { FieldRule, NodeSchema, NodeSource } from '../types';

type Key = Extract<keyof NodeSource, string>;

export function field(
  source: Key,
  options: Omit<FieldRule<NodeSource>, 'kind' | 'source'> = {},
): FieldRule<NodeSource> {
  return { kind: 'field', source, ...options };
}

export function quoted(source: Key): FieldRule<NodeSource> {
  return field(source, { default: '', transform: (value) => `"${String(value)}"` });
}

export function literal(value: unknown): FieldRule<NodeSource> {
  return field('protocol', { transform: () => value });
}

export function text(source: Key): FieldRule<NodeSource> {
  return field(source, { when: (value) => typeof value === 'string' && value.length > 0 });
}

export function fallback(source: Key, value: unknown): FieldRule<NodeSource> {
  return field(source, { default: value });
}

export function computed(transform: (node: Readonly<NodeSource>) => unknown): FieldRule<NodeSource> {
  return field('protocol', { transform: (_, node) => transform(node) });
}

export function object(fields: NodeSchema, when?: (node: Readonly<NodeSource>) => boolean) {
  return { kind: 'object' as const, fields, when };
}
