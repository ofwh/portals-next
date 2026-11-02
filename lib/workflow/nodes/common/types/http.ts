export interface HttpHeader {
  name: string;
  value: string;
}

export interface HttpRequestOptions extends Omit<RequestInit, 'headers'> {
  headers?: readonly HttpHeader[];
}
