import type { OutputFormat } from '../../types';

export interface HttpResponseHeader {
  name: string;
  value: string;
}
export interface HttpRequestHeader extends HttpResponseHeader {
  id: string;
}
export interface HttpRequestConfig {
  method: 'GET' | 'POST';
  url: string;
  headers: HttpRequestHeader[];
  body: string;
  outputFormat: OutputFormat;
}
export interface HttpRequestOutput {
  header: HttpResponseHeader[];
  body: unknown;
}
