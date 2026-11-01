import type { HeaderRow, RequestFormState, RouteFormState } from '@/lib/types/routes';

export function validPathname(value: string): boolean {
  return /^\/[a-zA-Z0-9_./-]+$/.test(value) && !value.endsWith('/');
}

export function validUrl(value: string): boolean {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function validJson(value: string): boolean {
  try {
    JSON.parse(value);

    return true;
  } catch {
    return false;
  }
}

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

export function selectedHeaders(rows: HeaderRow[]): HeaderRow[] {
  return rows.filter((row) => row.name.trim() || row.value);
}

export function validateBaseForm(form: RouteFormState) {
  if (!form.name.trim()) {
    return 'nameRequired';
  }

  if (form.name.trim().length > 100) {
    return 'nameMax';
  }

  if (!validPathname(form.pathname.trim())) {
    return 'pathnameInvalid';
  }

  if (form.expiredAt && !Number.isFinite(new Date(form.expiredAt).getTime())) {
    return 'expiredAtInvalid';
  }
}

export function validateRequestForm(form: RequestFormState) {
  if (!validUrl(form.url.trim())) {
    return 'urlInvalid';
  }

  if (form.method === 'POST' && form.format === 'JSON' && form.body.trim() && !validJson(form.body)) {
    return 'bodyInvalid';
  }

  const headers = selectedHeaders(form.headers);
  const names = headers.map((row) => row.name.trim().toLowerCase());

  if (headers.some((row) => !row.name.trim())) {
    return 'headerNameRequired';
  }

  if (new Set(names).size !== names.length) {
    return 'headerNameDuplicated';
  }
}
