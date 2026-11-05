import { rejectNode } from '../../proxy-node/debug';

export function isSimpleObfs(plugin: unknown): boolean {
  return plugin === 'obfs' || plugin === 'obfs-local' || plugin === 'simple-obfs';
}

export function escapeOption(value: string): string {
  return value.replace(/[:;=\\]/g, '\\$&');
}

export function parseOptions(value: string): [string, string][] {
  const result: [string, string][] = [];
  let key = '';
  let content = '';
  let hasValue = false;
  let escaped = false;

  for (const char of value + ';') {
    if (escaped) {
      if (hasValue) {
        content += char;
      } else {
        key += char;
      }

      escaped = false;
    } else if (char === '\\') {
      escaped = true;
    } else if (char === ';') {
      if (key) {
        result.push([key, hasValue ? content : 'true']);
      }

      key = '';
      content = '';
      hasValue = false;
    } else if (char === '=' && !hasValue) {
      hasValue = true;
    } else if (hasValue) {
      content += char;
    } else {
      key += char;
    }
  }

  if (escaped || key || content) {
    return rejectNode('invalid-plugin-parameter');
  }

  return result;
}
