import { selectedHeaders } from '@/lib/shared/headers';
import { validJson, validPathname, validUrl } from '@/lib/shared/validation';
import type { RequestFormState, RouteFormState } from '@/lib/types/routes';

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
