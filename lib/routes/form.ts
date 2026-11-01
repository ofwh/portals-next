import type { RequestFormState, RouteFormState } from '@/lib/types/routes';
import { parseHeaders, selectedHeaders } from './validation';

export function initialRouteForm(): RouteFormState {
  return { name: '', description: '', status: true, pathname: '', token: '', expiredAt: '', tagIds: [] };
}

export function routeDetailForm(detail: {
  name: string;
  description: string | null;
  status: boolean;
  pathname: string;
  token: string | null;
  expiredAt: string | null;
  tagIds: string[];
}): RouteFormState {
  return {
    name: detail.name,
    description: detail.description ?? '',
    status: detail.status,
    pathname: detail.pathname,
    token: detail.token ?? '',
    expiredAt: detail.expiredAt ?? '',
    tagIds: detail.tagIds ?? [],
  };
}

export function routeInput(form: RouteFormState) {
  return {
    name: form.name.trim(),
    description: form.description.trim() || null,
    status: form.status,
    pathname: form.pathname.trim(),
    token: form.token.trim() || null,
    expiredAt: form.expiredAt ? new Date(form.expiredAt).toISOString() : null,
    tagIds: form.tagIds,
  };
}

export function initialRequestForm(): RequestFormState {
  return {
    ...initialRouteForm(),
    url: '',
    method: 'GET',
    cors: 0,
    proxy: '',
    format: 'JSON',
    body: '',
    headers: [{ id: 'initial', name: '', value: '' }],
  };
}

export function requestDetailForm(
  detail: Parameters<typeof routeDetailForm>[0] & {
    url: string;
    method: RequestFormState['method'];
    cors: RequestFormState['cors'];
    proxy: string | null;
    format: RequestFormState['format'];
    body: string | null;
    headers: string | null;
  },
): RequestFormState {
  const rows = Object.entries(parseHeaders(detail.headers)).map(([name, value]) => ({
    id: crypto.randomUUID(),
    name,
    value,
  }));

  return {
    ...routeDetailForm(detail),
    url: detail.url,
    method: detail.method,
    cors: detail.cors,
    proxy: detail.proxy ?? '',
    format: detail.format,
    body: detail.body ?? '',
    headers: rows.length ? rows : initialRequestForm().headers,
  };
}

export function requestInput(form: RequestFormState) {
  const headers = selectedHeaders(form.headers);

  return {
    ...routeInput(form),
    url: form.url.trim(),
    method: form.method,
    cors: form.cors,
    proxy: form.proxy.trim() || null,
    format: form.format,
    body: form.method === 'POST' ? form.body || null : null,
    headers: headers.length
      ? JSON.stringify(Object.fromEntries(headers.map((row) => [row.name.trim(), row.value])))
      : null,
  };
}
