export function parseInteger(value: string | undefined): number {
  const result = Number.parseInt(value ?? '', 10);

  return Number.isFinite(result) ? result : 0;
}

export function splitFields(value: string, separator: string): string[] {
  if (!value) {
    return [];
  }

  const fields = value.split(separator);

  if (fields.at(-1) === '') {
    fields.pop();
  }

  return fields;
}
