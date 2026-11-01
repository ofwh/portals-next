export interface ClashProxy {
  name: string;
  type: string;
  server: string;
  port: number;
  [key: string]: unknown;
}

export interface FormatParser {
  matches(content: string): boolean;
  extract(content: string): unknown[];
}
