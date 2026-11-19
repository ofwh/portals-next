export function uniqueColumns(error: unknown): string[] {
  const visited = new Set<unknown>();
  let current = error;

  while (current instanceof Error && !visited.has(current)) {
    visited.add(current);

    if ('code' in current && current.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return current.message
        .split(':')
        .slice(1)
        .join(':')
        .split(',')
        .map((column) => column.trim());
    }

    current = current.cause;
  }

  return [];
}
