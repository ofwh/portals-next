const withCharset = (type: string) => `${type}; charset=utf-8`;

export const CODE_LANGUAGES = [
  { value: 'plaintext', label: 'Plain Text', contentType: withCharset('text/plain') },
  { value: 'json', label: 'JSON', contentType: withCharset('application/json') },
  { value: 'javascript', label: 'JavaScript', contentType: withCharset('text/javascript') },
  { value: 'typescript', label: 'TypeScript', contentType: withCharset('text/plain') },
  { value: 'yaml', label: 'YAML', contentType: 'application/yaml' },
  { value: 'toml', label: 'TOML', contentType: 'application/toml' },
  { value: 'xml', label: 'XML', contentType: withCharset('application/xml') },
  { value: 'html', label: 'HTML', contentType: withCharset('text/html') },
  { value: 'css', label: 'CSS', contentType: withCharset('text/css') },
  { value: 'markdown', label: 'Markdown', contentType: withCharset('text/markdown') },
  { value: 'python', label: 'Python', contentType: withCharset('text/plain') },
  { value: 'java', label: 'Java', contentType: withCharset('text/plain') },
  { value: 'go', label: 'Go', contentType: withCharset('text/plain') },
  { value: 'rust', label: 'Rust', contentType: withCharset('text/plain') },
  { value: 'sql', label: 'SQL', contentType: 'application/sql' },
  { value: 'shell', label: 'Shell', contentType: withCharset('text/plain') },
];

export const DEFAULT_CODE_LANGUAGE = CODE_LANGUAGES[0];
