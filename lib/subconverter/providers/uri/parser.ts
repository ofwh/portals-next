import { debugNode } from '../../proxy-node/debug';
import type { UriConfig, UriProxyNode, UriUrlProxyNode } from '../../types/providers/uri';
import { parseIni } from '../ini/parser';
import { base64, json, oneOf, optional, port, shape, stringOrNumber, text } from '../schema';
import { ssrProxyNode } from '../ssr/parser';

export const vmessShareNode = shape({
  add: text,
  port,
  id: text,
  v: optional(stringOrNumber),
  ps: optional(text),
  aid: optional(stringOrNumber),
  scy: optional(text),
  net: optional(text),
  type: optional(text),
  host: optional(text),
  path: optional(text),
  tls: optional(text),
  sni: optional(text),
  alpn: optional(text),
  fp: optional(text),
});

const schemeReader = oneOf(
  'ss',
  'ssr',
  'vmess',
  'vmess1',
  'vless',
  'vless1',
  'trojan',
  'trojan-go',
  'socks',
  'socks5',
  'socks5h',
  'http',
  'https',
  'tg',
  'hysteria',
  'hy',
  'hysteria2',
  'hy2',
  'hysteria2+realm',
  'hy2+realm',
  'hysteria2+realm+http',
  'tuic',
  'anytls',
  'naive+https',
  'naive+quic',
  'wireguard',
  'mieru',
  'mierus',
);

function queryFields(query: string): [string, string][] {
  return query
    ? query.split('&').map((item) => {
        const separator = item.indexOf('=');

        return separator < 0
          ? [decodeURIComponent(item), '']
          : [decodeURIComponent(item.slice(0, separator)), decodeURIComponent(item.slice(separator + 1))];
      })
    : [];
}

function parseSsr(raw: string): UriProxyNode {
  const payload = base64(raw.slice(6));
  const separator = payload.indexOf('/?');
  const main = separator < 0 ? payload : payload.slice(0, separator);
  const query = queryFields(separator < 0 ? '' : payload.slice(separator + 2));
  const fields = /^(\[[^\]]+\]|[^:]+):(\d+):([^:]+):([^:]+):([^:]+):([^:]+)$/.exec(main);

  if (!fields) {
    throw new Error('Invalid SSR subscription node');
  }

  const options = new Map(query);
  const decodedOption = (key: string) => (options.get(key) ? base64(options.get(key) ?? '') : undefined);

  return {
    scheme: 'ssr',
    raw,
    query,
    config: ssrProxyNode({
      server: fields[1].replace(/^\[|\]$/g, ''),
      server_port: fields[2],
      protocol: fields[3],
      method: fields[4],
      obfs: fields[5],
      password: base64(fields[6]),
      remarks: decodedOption('remarks'),
      group: decodedOption('group'),
      obfsparam: decodedOption('obfsparam'),
      protocolparam: decodedOption('protoparam'),
    }),
  };
}

function escapeCredentials(authority: string): string {
  const at = authority.lastIndexOf('@');

  if (at < 0) {
    return authority;
  }

  const credentials = authority.slice(0, at);
  const colon = credentials.indexOf(':');

  if (colon < 0) {
    return `${encodeURIComponent(credentials)}${authority.slice(at)}`;
  }

  return `${encodeURIComponent(credentials.slice(0, colon))}:${encodeURIComponent(credentials.slice(colon + 1))}${authority.slice(at)}`;
}

export function parseUri(raw: string): UriProxyNode {
  const prefix = /^([a-z][a-z0-9+.-]*):\/\//i.exec(raw);

  if (!prefix) {
    throw new Error('Invalid subscription URI');
  }

  const scheme = schemeReader(prefix[1].toLowerCase());
  const payload = raw.slice(prefix[0].length);

  if (scheme === 'ssr') {
    return parseSsr(raw);
  }

  const hash = payload.indexOf('#');
  const name = hash < 0 ? '' : decodeURIComponent(payload.slice(hash + 1));
  const withoutFragment = hash < 0 ? payload : payload.slice(0, hash);
  const question = withoutFragment.indexOf('?');
  const query = queryFields(question < 0 ? '' : withoutFragment.slice(question + 1));
  let authority = question < 0 ? withoutFragment : withoutFragment.slice(0, question);

  if ((scheme === 'vmess' || scheme === 'vmess1') && !authority.includes('@')) {
    const decoded = base64(authority);

    if (decoded.trimStart().startsWith('{')) {
      return { scheme, raw, config: vmessShareNode(json(decoded)) };
    }

    if (/^.+?\s*=\s*.+/.test(decoded)) {
      const config = parseIni(decoded).proxies[0];

      if (!config) {
        throw new Error('Invalid VMess subscription node');
      }

      return { scheme, raw, config };
    }

    authority = escapeCredentials(decoded);
  }

  if (['ss', 'socks', 'socks5', 'socks5h', 'http', 'https'].includes(scheme)) {
    authority = authority.replace(/\/$/, '');
    if (
      !authority.includes(':') &&
      !authority.includes('@') &&
      !(['http', 'https'].includes(scheme) && authority.includes('.'))
    ) {
      authority = escapeCredentials(base64(authority));
    }

    const at = authority.lastIndexOf('@');

    if (at > 0 && !authority.slice(0, at).includes(':')) {
      authority = escapeCredentials(`${base64(authority.slice(0, at))}${authority.slice(at)}`);
    }
  }

  let ports: string | undefined;
  const hopping = /^(.*@)?(\[[^\]]+\]|[^:/]+):([\d,:-]+)(\/.*)?$/.exec(authority);

  if (hopping && /[,:-]/.test(hopping[3]) && ['hysteria', 'hy', 'hysteria2', 'hy2'].includes(scheme)) {
    ports = hopping[3];
    for (const range of ports.split(',')) {
      const bounds = range.split(/[:-]/);

      if (bounds.length > 2 || bounds.some((bound) => !bound)) {
        throw new Error('Invalid URI port range');
      }

      const first = Number(port(bounds[0]));
      const last = Number(port(bounds[1] ?? bounds[0]));

      if (first > last) {
        throw new Error('Invalid URI port range');
      }
    }

    authority = `${hopping[1] ?? ''}${hopping[2]}:${ports.split(/[,:-]/)[0]}${hopping[4] ?? ''}`;
  }

  const url = new URL(`proxy://${authority}`);
  const options = new Map(query);
  const telegram =
    scheme === 'tg' || (scheme === 'https' && url.hostname === 't.me' && ['/socks', '/http'].includes(url.pathname));
  const server = telegram ? (options.get('server') ?? '') : url.hostname.replace(/^\[|\]$/g, '');
  const portValue = telegram ? options.get('port') : url.port;
  const node: UriUrlProxyNode = {
    scheme,
    raw,
    name: name || options.get('remarks') || '',
    server,
    ...(portValue ? { port: Number(port(portValue)) } : {}),
    ...(ports ? { ports } : {}),
    username: telegram ? (options.get('user') ?? '') : decodeURIComponent(url.username),
    password: telegram ? (options.get('pass') ?? '') : decodeURIComponent(url.password),
    path: url.pathname,
    query,
  };

  if (
    !server ||
    (!node.port &&
      ![
        'hysteria',
        'hy',
        'hysteria2',
        'hy2',
        'hysteria2+realm',
        'hy2+realm',
        'hysteria2+realm+http',
        'mieru',
        'mierus',
        'naive+https',
        'naive+quic',
        'http',
        'https',
      ].includes(scheme))
  ) {
    throw new Error('Subscription URI requires a proxy endpoint');
  }

  return node;
}

export function parse(content: string): UriConfig {
  const nodes: UriProxyNode[] = [];
  let entryIndex = 0;

  if (
    content.trim() &&
    !content.includes('://') &&
    content
      .split(/\r?\n/)
      .some((line) => line.trim() && !['#', ';', '//'].some((prefix) => line.trim().startsWith(prefix)))
  ) {
    throw new Error('Expected a URI subscription');
  }

  for (const line of content.replace(/^\uFEFF/, '').split(/\r\n|\n|\r/)) {
    const value = line.trim();

    if (!value || value.startsWith('#') || value.startsWith(';') || value.startsWith('//')) {
      continue;
    }

    for (const uri of value.split(/\s+/)) {
      const index = entryIndex++;

      try {
        nodes.push(parseUri(uri));
      } catch {
        debugNode('uri', 'parse', index, 'invalid-or-unsupported-node');
      }
    }
  }

  return { nodes };
}
