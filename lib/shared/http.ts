export interface HttpHeader {
  name: string;
  value: string;
}

export interface HttpRequestOptions extends Omit<RequestInit, 'headers'> {
  headers?: readonly HttpHeader[];
  requestId?: string;
}

export function createHeaders(values: readonly HttpHeader[]): Headers {
  const headers = new Headers();

  for (const { name, value } of values) {
    headers.append(name, value);
  }

  return headers;
}

export function request(url: string, options: HttpRequestOptions = {}): Promise<Response> {
  const { headers = [], requestId, ...init } = options;
  const requestHeaders = createHeaders(headers);

  if (requestId) {
    requestHeaders.set(REQUEST_ID_HEADER, requestId);
  }

  return fetch(url, { ...init, headers: requestHeaders });
}

export const REQUEST_ID_HEADER = 'X-Request-Id';
