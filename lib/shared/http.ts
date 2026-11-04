export interface HttpHeader {
  name: string;
  value: string;
}

export interface HttpRequestOptions extends Omit<RequestInit, 'headers'> {
  headers?: readonly HttpHeader[];
}

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
