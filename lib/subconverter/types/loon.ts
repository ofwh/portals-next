export interface LoonConfig {
  [key: string]: unknown;
  Proxy?: string[];
  'Proxy Group'?: string[];
  Rule?: string[];
  'Remote Rule'?: string[];
}
