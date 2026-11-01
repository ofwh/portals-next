import type { RuleSetEntry } from '../types/ruleset';

export function parse(lines: string[]): RuleSetEntry[] {
  return lines
    .filter((line) => line.trim() && !/^\s*[#;]/.test(line))
    .map((line) => {
      const [type, value, ...rest] = line.split(',').map((part) => part.trim());

      if (!type || !value) {
        throw new Error('Invalid text rule');
      }

      const terminal = type === 'MATCH' || type === 'FINAL';
      const outbound = terminal ? value : rest[0] === 'no-resolve' ? undefined : rest[0];

      return {
        type,
        values: terminal ? [] : [value],
        ...(outbound ? { outbound } : {}),
        options: terminal ? rest : rest.filter((_, index) => index > 0 || rest[0] === 'no-resolve'),
      };
    });
}

export function format(entries: RuleSetEntry[]): string[] {
  return entries.flatMap((entry) => {
    if (entry.values.length > 1 && entry.type === 'AND') {
      throw new Error('Logical text rules are not supported');
    }

    const values = entry.values.length ? entry.values : [''];

    return values.map((value) =>
      [
        entry.type,
        ...(value ? [value] : []),
        ...(entry.outbound ? [entry.outbound] : []),
        ...(entry.options ?? []),
      ].join(','),
    );
  });
}
