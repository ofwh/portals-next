export function parseHeaders(value: string | null): Record<string, string> {
  const parsed: unknown = value === null ? {} : JSON.parse(value);

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error();
  }

  const names = new Set<string>();

  for (const [name, content] of Object.entries(parsed)) {
    if (typeof content !== 'string' || !name.trim() || name !== name.trim() || names.has(name.toLowerCase())) {
      throw new Error();
    }

    names.add(name.toLowerCase());
  }

  return Object.fromEntries(Object.entries(parsed)) as Record<string, string>;
}

export function selectedHeaders<Row extends { name: string; value: string }>(rows: Row[]): Row[] {
  return rows.filter((row) => row.name.trim() || row.value);
}
