import type { HttpHeader, HttpRequestOptions } from '../types/http';

export function createHeaders(values: readonly HttpHeader[]): Headers {
  const headers = new Headers();

  for (const { name, value } of values) {
    headers.append(name, value);
  }

  return headers;
}

export function request(url: string, options: HttpRequestOptions = {}): Promise<Response> {
  const { headers = [], ...init } = options;

  return fetch(url, { ...init, headers: createHeaders(headers) });
}
