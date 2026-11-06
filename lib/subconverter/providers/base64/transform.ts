import { get } from '../../proxy-node/mapping';
import { createTransform } from '../../proxy-node/transform';
import type { Base64Config, Base64Node } from '../../types/providers/base64';
import { extract as extractIni, toFields as iniFields, toNode as iniNode, readNode as readIni } from '../ini/transform';
import { readNode as readUri, transform as uriTransform } from '../uri/transform';

export const supports = [
  'ss',
  'ssr',
  'vmess',
  'vless',
  'trojan',
  'snell',
  'http',
  'https',
  'socks5',
  'wireguard',
  'hysteria',
  'hysteria2',
  'tuic',
  'anytls',
  'naive',
  'mieru',
] as const;

function readNode(value: unknown): Base64Node {
  return get(value, 'scheme') !== undefined ? readUri(value) : readIni(value);
}

export function extract(config: Base64Config): Base64Node[] {
  return 'nodes' in config ? config.nodes : extractIni(config);
}

export const transform = createTransform({
  provider: 'base64',
  supports,
  readNode,
  toFields(node) {
    return 'scheme' in node ? uriTransform('fields', [node]) : iniFields(node);
  },
  toNode(fields): Base64Node {
    if (fields.type === 'snell') {
      return iniNode(fields, 'surge');
    }

    const nodes = uriTransform('node', [fields]);

    if (!nodes.length) {
      return iniNode(fields, 'surge');
    }

    return nodes[0];
  },
});
