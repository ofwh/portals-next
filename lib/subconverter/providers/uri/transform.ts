import { vmessShareNode } from './parser';
import { rejectNode } from '../../proxy-node/debug';
import {
  assertCovered,
  convert,
  expand,
  flatten,
  get,
  nativeFingerprint,
  put,
  remove,
  validateFields,
} from '../../proxy-node/mapping';
import { createTransform } from '../../proxy-node/transform';
import type { UriConfig, UriNode, UriUrlProxyNode } from '../../types/providers/uri';
import type { ProxyNodeFields } from '../../types/proxy-node/fields';
import type { Binding } from '../../types/proxy-node/mapping';
import { toFields as iniToFields, readNode as readIniNode } from '../ini/transform';
import { array, base64, camelCase, object, oneOf, optional, port, shape, text } from '../schema';
import { escapeOption, isSimpleObfs } from '../ss/plugin';
import { transform as ssTransform } from '../ss/transform';
import { ssrProxyNode } from '../ssr/parser';
import { transform as ssrTransform } from '../ssr/transform';

export const supports = [
  'ss',
  'ssr',
  'vmess',
  'vless',
  'trojan',
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
const bindings = {
  vmess: [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'username',
      field: 'uuid',
    },
    {
      path: 'query.encryption',
      field: 'cipher',
    },
    {
      path: 'query.alterId',
      field: 'alterId',
      codec: 'numberText',
    },
    {
      path: 'query.type',
      field: 'network',
    },
    {
      path: 'query.network',
      field: 'network',
    },
    {
      path: 'query.host',
      field: 'headers',
      codec: 'hostHeaderSingle',
    },
    {
      path: 'query.path',
      field: 'path',
    },
    {
      path: 'query.serviceName',
      field: 'grpcServiceName',
    },
    {
      path: 'query.mode',
      field: 'grpcMode',
    },
    {
      path: 'query.headerType',
      field: 'headerType',
    },
    {
      path: 'query.pbk',
      field: 'realityPublicKey',
    },
    {
      path: 'query.sid',
      field: 'realityShortId',
    },
    {
      path: 'query.sni',
      field: 'serverName',
    },
    {
      path: 'query.peer',
      field: 'serverName',
    },
    {
      path: 'query.alpn',
      field: 'alpn',
      codec: 'comma',
    },
    {
      path: 'query.insecure',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.allowInsecure',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.skipCertVerify',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.fp',
      field: 'clientFingerprint',
    },
    {
      path: 'query.fingerprint',
      field: 'clientFingerprint',
    },
    {
      path: 'query.disableSni',
      field: 'disableSni',
      codec: 'booleanText',
    },
  ],
  vless: [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'username',
      field: 'uuid',
    },
    {
      path: 'query.encryption',
      field: 'encryption',
    },
    {
      path: 'query.flow',
      field: 'flow',
    },
    {
      path: 'query.packetEncoding',
      field: 'packetEncoding',
    },
    {
      path: 'query.type',
      field: 'network',
    },
    {
      path: 'query.network',
      field: 'network',
    },
    {
      path: 'query.host',
      field: 'headers',
      codec: 'hostHeaderSingle',
    },
    {
      path: 'query.path',
      field: 'path',
    },
    {
      path: 'query.serviceName',
      field: 'grpcServiceName',
    },
    {
      path: 'query.mode',
      field: 'grpcMode',
    },
    {
      path: 'query.headerType',
      field: 'headerType',
    },
    {
      path: 'query.pbk',
      field: 'realityPublicKey',
    },
    {
      path: 'query.sid',
      field: 'realityShortId',
    },
    {
      path: 'query.sni',
      field: 'serverName',
    },
    {
      path: 'query.peer',
      field: 'serverName',
    },
    {
      path: 'query.alpn',
      field: 'alpn',
      codec: 'comma',
    },
    {
      path: 'query.insecure',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.allowInsecure',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.skipCertVerify',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.fp',
      field: 'clientFingerprint',
    },
    {
      path: 'query.fingerprint',
      field: 'clientFingerprint',
    },
    {
      path: 'query.disableSni',
      field: 'disableSni',
      codec: 'booleanText',
    },
  ],
  trojan: [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'username',
      field: 'password',
    },
    {
      path: 'query.type',
      field: 'network',
    },
    {
      path: 'query.network',
      field: 'network',
    },
    {
      path: 'query.host',
      field: 'headers',
      codec: 'hostHeaderSingle',
    },
    {
      path: 'query.path',
      field: 'path',
    },
    {
      path: 'query.serviceName',
      field: 'grpcServiceName',
    },
    {
      path: 'query.pbk',
      field: 'realityPublicKey',
    },
    {
      path: 'query.sid',
      field: 'realityShortId',
    },
    {
      path: 'query.sni',
      field: 'serverName',
    },
    {
      path: 'query.peer',
      field: 'serverName',
    },
    {
      path: 'query.alpn',
      field: 'alpn',
      codec: 'comma',
    },
    {
      path: 'query.insecure',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.allowInsecure',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.skipCertVerify',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.fp',
      field: 'clientFingerprint',
    },
    {
      path: 'query.fingerprint',
      field: 'clientFingerprint',
    },
    {
      path: 'query.disableSni',
      field: 'disableSni',
      codec: 'booleanText',
    },
  ],
  anytls: [
    { path: 'query.udp', field: 'udp', codec: 'booleanText' },
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'username',
      field: 'password',
    },
    {
      path: 'query.idleSessionCheckInterval',
      field: 'idleSessionCheckInterval',
      codec: 'numberText',
    },
    {
      path: 'query.idleSessionTimeout',
      field: 'idleSessionTimeout',
      codec: 'numberText',
    },
    {
      path: 'query.minIdleSession',
      field: 'minIdleSession',
      codec: 'numberText',
    },
    {
      path: 'query.sni',
      field: 'serverName',
    },
    {
      path: 'query.peer',
      field: 'serverName',
    },
    {
      path: 'query.alpn',
      field: 'alpn',
      codec: 'comma',
    },
    {
      path: 'query.insecure',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.allowInsecure',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.skipCertVerify',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.fp',
      field: 'clientFingerprint',
    },
    {
      path: 'query.fingerprint',
      field: 'clientFingerprint',
    },
    {
      path: 'query.disableSni',
      field: 'disableSni',
      codec: 'booleanText',
    },
  ],
  http: [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'username',
      field: 'username',
    },
    {
      path: 'password',
      field: 'password',
    },
    {
      path: 'query.sni',
      field: 'serverName',
    },
    {
      path: 'query.peer',
      field: 'serverName',
    },
    {
      path: 'query.alpn',
      field: 'alpn',
      codec: 'comma',
    },
    {
      path: 'query.insecure',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.allowInsecure',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.skipCertVerify',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.fp',
      field: 'clientFingerprint',
    },
    {
      path: 'query.fingerprint',
      field: 'clientFingerprint',
    },
    {
      path: 'query.disableSni',
      field: 'disableSni',
      codec: 'booleanText',
    },
  ],
  https: [
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'username',
      field: 'username',
    },
    {
      path: 'password',
      field: 'password',
    },
    {
      path: 'query.sni',
      field: 'serverName',
    },
    {
      path: 'query.peer',
      field: 'serverName',
    },
    {
      path: 'query.alpn',
      field: 'alpn',
      codec: 'comma',
    },
    {
      path: 'query.insecure',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.allowInsecure',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.skipCertVerify',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.fp',
      field: 'clientFingerprint',
    },
    {
      path: 'query.fingerprint',
      field: 'clientFingerprint',
    },
    {
      path: 'query.disableSni',
      field: 'disableSni',
      codec: 'booleanText',
    },
  ],
  socks5: [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'username',
      field: 'username',
    },
    {
      path: 'password',
      field: 'password',
    },
  ],
  hysteria: [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'query.auth',
      field: 'authString',
    },
    {
      path: 'query.upmbps',
      field: 'upMbps',
      codec: 'numberText',
    },
    {
      path: 'query.downmbps',
      field: 'downMbps',
      codec: 'numberText',
    },
    {
      path: 'query.obfs',
      field: 'obfs',
    },
    {
      path: 'query.peer',
      field: 'serverName',
    },
    {
      path: 'query.mport',
      field: 'ports',
      codec: 'ports',
    },
    {
      path: 'query.hopInterval',
      field: 'hopInterval',
      codec: 'numberText',
    },
    {
      path: 'query.sni',
      field: 'serverName',
    },
    {
      path: 'query.peer',
      field: 'serverName',
    },
    {
      path: 'query.alpn',
      field: 'alpn',
      codec: 'comma',
    },
    {
      path: 'query.insecure',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.allowInsecure',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.skipCertVerify',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.fp',
      field: 'clientFingerprint',
    },
    {
      path: 'query.fingerprint',
      field: 'clientFingerprint',
    },
    {
      path: 'query.disableSni',
      field: 'disableSni',
      codec: 'booleanText',
    },
  ],
  hysteria2: [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'username',
      field: 'password',
    },
    {
      path: 'ports',
      field: 'ports',
      codec: 'ports',
    },
    {
      path: 'query.ports',
      field: 'ports',
      codec: 'ports',
    },
    {
      path: 'query.mport',
      field: 'ports',
      codec: 'ports',
    },
    {
      path: 'query.obfs',
      field: 'obfs',
    },
    {
      path: 'query.obfsPassword',
      field: 'obfsPassword',
    },
    {
      path: 'query.hopInterval',
      field: 'hopInterval',
      codec: 'numberText',
    },
    {
      path: 'query.ech',
      field: 'hysteria2Ech',
    },
    {
      path: 'query.sni',
      field: 'serverName',
    },
    {
      path: 'query.peer',
      field: 'serverName',
    },
    {
      path: 'query.alpn',
      field: 'alpn',
      codec: 'comma',
    },
    {
      path: 'query.insecure',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.allowInsecure',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.skipCertVerify',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.fp',
      field: 'clientFingerprint',
    },
    {
      path: 'query.fingerprint',
      field: 'clientFingerprint',
    },
    {
      path: 'query.disableSni',
      field: 'disableSni',
      codec: 'booleanText',
    },
  ],
  tuic: [
    {
      path: 'name',
      field: 'name',
    },
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'username',
      field: 'uuid',
    },
    {
      path: 'password',
      field: 'password',
    },
    {
      path: 'query.token',
      field: 'token',
    },
    {
      path: 'query.congestionControl',
      field: 'congestionControl',
    },
    {
      path: 'query.congestionController',
      field: 'congestionControl',
    },
    {
      path: 'query.udpRelayMode',
      field: 'udpRelayMode',
    },
    {
      path: 'query.zeroRttHandshake',
      field: 'zeroRttHandshake',
      codec: 'booleanText',
    },
    {
      path: 'query.reduceRtt',
      field: 'zeroRttHandshake',
      codec: 'booleanText',
    },
    {
      path: 'query.disableSni',
      field: 'disableSni',
      codec: 'booleanText',
    },
    {
      path: 'query.sni',
      field: 'serverName',
    },
    {
      path: 'query.peer',
      field: 'serverName',
    },
    {
      path: 'query.alpn',
      field: 'alpn',
      codec: 'comma',
    },
    {
      path: 'query.insecure',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.allowInsecure',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.skipCertVerify',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.fp',
      field: 'clientFingerprint',
    },
    {
      path: 'query.fingerprint',
      field: 'clientFingerprint',
    },
    {
      path: 'query.disableSni',
      field: 'disableSni',
      codec: 'booleanText',
    },
  ],
  naive: [
    {
      path: 'server',
      field: 'server',
    },
    {
      path: 'port',
      field: 'port',
      codec: 'port',
    },
    {
      path: 'username',
      field: 'username',
    },
    {
      path: 'password',
      field: 'password',
    },
    {
      path: 'query.insecureConcurrency',
      field: 'naiveInsecureConcurrency',
      codec: 'numberText',
    },
    {
      path: 'query.sni',
      field: 'serverName',
    },
    {
      path: 'query.peer',
      field: 'serverName',
    },
    {
      path: 'query.alpn',
      field: 'alpn',
      codec: 'comma',
    },
    {
      path: 'query.insecure',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.allowInsecure',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.skipCertVerify',
      field: 'allowInsecure',
      codec: 'booleanText',
    },
    {
      path: 'query.fp',
      field: 'clientFingerprint',
    },
    {
      path: 'query.fingerprint',
      field: 'clientFingerprint',
    },
    {
      path: 'query.disableSni',
      field: 'disableSni',
      codec: 'booleanText',
    },
  ],
} as const satisfies {
  [K in Exclude<(typeof supports)[number], 'ss' | 'ssr' | 'wireguard' | 'mieru'>]: readonly Binding[];
};
const shareBindings = [
  {
    path: 'ps',
    field: 'name',
  },
  {
    path: 'add',
    field: 'server',
  },
  {
    path: 'port',
    field: 'port',
    codec: 'port',
  },
  {
    path: 'id',
    field: 'uuid',
  },
  {
    path: 'aid',
    field: 'alterId',
    codec: 'numberText',
  },
  {
    path: 'scy',
    field: 'cipher',
  },
  {
    path: 'net',
    field: 'network',
  },
  {
    path: 'type',
    field: 'headerType',
  },
  {
    path: 'host',
    field: 'headers',
    codec: 'hostHeaderSingle',
  },
  {
    path: 'path',
    field: 'path',
  },
  {
    path: 'tls',
    field: 'tls',
    codec: 'tlsMode',
  },
  {
    path: 'sni',
    field: 'serverName',
  },
  {
    path: 'alpn',
    field: 'alpn',
    codec: 'comma',
  },
  {
    path: 'fp',
    field: 'clientFingerprint',
  },
] as const satisfies readonly Binding[];
const scheme = oneOf(
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
const queryReader = array((value): [string, string] => {
  if (!Array.isArray(value) || value.length !== 2) {
    return rejectNode('invalid-uri-query');
  }

  return [text(value[0]), text(value[1])];
});
const urlReader = shape({
  scheme,
  raw: optional(text),
  name: text,
  server: text,
  port: optional(port),
  ports: optional(text),
  username: text,
  password: text,
  path: text,
  query: queryReader,
});

export function readNode(value: unknown): UriNode {
  const source = object(value);

  assertCovered(source, [
    'scheme',
    'raw',
    'config',
    'query',
    'name',
    'server',
    'port',
    'ports',
    'username',
    'password',
    'path',
  ]);
  const kind = scheme(get(source, 'scheme'));
  const raw = get(source, 'raw');
  const config = get(source, 'config');

  if (config !== undefined) {
    if (kind === 'ssr') {
      return {
        scheme: 'ssr',
        config: ssrProxyNode(config),
        query: queryReader(get(source, 'query')),
        ...(raw !== undefined ? { raw: text(raw) } : {}),
      };
    }

    if (kind === 'vmess' || kind === 'vmess1') {
      return {
        scheme: kind,
        config: get(config, 'arguments') !== undefined ? readIniNode(config) : vmessShareNode(config),
        ...(raw !== undefined ? { raw: text(raw) } : {}),
      };
    }

    return rejectNode('invalid-uri-node');
  }

  const node = urlReader(value);

  return { ...node, port: node.port === undefined ? undefined : Number(node.port) };
}

export function extract(config: UriConfig): UriNode[] {
  return config.nodes;
}

function queryObject(node: UriUrlProxyNode): object {
  const result = {};

  for (const [rawKey, value] of node.query) {
    const key = camelCase(rawKey);

    if (get(result, key) !== undefined && get(result, key) !== value) {
      return rejectNode('ambiguous-uri-query');
    }

    put(result, key, value);
  }

  return result;
}

function one<T>(items: T[]): T {
  if (items.length !== 1) {
    return rejectNode('unrepresentable-uri-node');
  }

  return items[0];
}

function wireGuardFields(node: UriUrlProxyNode, query: object): ProxyNodeFields {
  assertCovered(query, ['publickey', 'address', 'mtu', 'reserved', 'presharedkey']);
  const addresses = text(get(query, 'address'))
    .split(',')
    .map((address) => address.trim())
    .map((address) => (address.includes('/') ? address : `${address}/${address.includes(':') ? 128 : 32}`));
  const peer = { server: node.server, port: Number(port(node.port)), publicKey: text(get(query, 'publickey')) };

  if (get(query, 'presharedkey') !== undefined) {
    put(peer, 'preSharedKey', text(get(query, 'presharedkey')));
  }

  if (get(query, 'reserved') !== undefined) {
    put(
      peer,
      'reserved',
      text(get(query, 'reserved'))
        .split(/[,/]/)
        .map((part) => Number(convert(part.trim(), 'number'))),
    );
  }

  return validateFields({
    type: 'wireguard',
    name: node.name || `${node.server}:${node.port}`,
    privateKey: node.username,
    localAddresses: addresses,
    wireGuardPeers: [peer],
    ...(get(query, 'mtu') !== undefined ? { mtu: Number(convert(get(query, 'mtu'), 'number')) } : {}),
  });
}

function mieruFields(node: UriUrlProxyNode): ProxyNodeFields[] {
  const ports = node.query.filter(([key]) => key === 'port').map(([, value]) => value);
  const protocols = node.query.filter(([key]) => key === 'protocol').map(([, value]) => value);

  if (!ports.length || ports.length !== protocols.length) {
    return rejectNode('invalid-mieru-bindings');
  }

  const query = queryObject({ ...node, query: node.query.filter(([key]) => key !== 'port' && key !== 'protocol') });

  assertCovered(query, ['profile', 'mtu', 'multiplexing', 'handshakeMode', 'trafficPattern']);
  const profile = text(get(query, 'profile'));

  return ports.map((range, index) => {
    if (!['TCP', 'UDP'].includes(protocols[index])) {
      return rejectNode('invalid-mieru-protocol');
    }

    const limits = range.split('-');

    if (limits.length > 2 || Number(port(limits[0])) > Number(port(limits[1] ?? limits[0]))) {
      return rejectNode('invalid-port-range');
    }

    return validateFields({
      type: 'mieru',
      name: node.name || profile,
      server: node.server,
      port: Number(port(limits[0])),
      username: node.username,
      password: node.password,
      ports: [range],
      network: protocols[index],
      mieruProfile: profile,
      ...(get(query, 'mtu') !== undefined ? { mtu: Number(convert(get(query, 'mtu'), 'number')) } : {}),
      ...(get(query, 'multiplexing') !== undefined ? { multiplexing: get(query, 'multiplexing') } : {}),
      ...(get(query, 'handshakeMode') !== undefined ? { mieruHandshakeMode: get(query, 'handshakeMode') } : {}),
      ...(get(query, 'trafficPattern') !== undefined ? { mieruTrafficPattern: get(query, 'trafficPattern') } : {}),
    });
  });
}

function toFields(node: UriNode): ProxyNodeFields | ProxyNodeFields[] {
  if ('config' in node) {
    if (node.scheme === 'ssr') {
      for (const [key] of node.query) {
        if (!['remarks', 'group', 'obfsparam', 'protoparam'].includes(key)) {
          return rejectNode('unrepresentable-uri-query');
        }
      }

      return one(ssrTransform('fields', [node.config]));
    }

    if ('arguments' in node.config) {
      return iniToFields(readIniNode(node.config));
    }

    const source = { ...node.config };

    if (node.config.v !== undefined && !['1', '2'].includes(String(node.config.v))) {
      return rejectNode('unsupported-vmess-share-version');
    }

    if (String(node.config.v ?? '1') === '1' && node.config.host?.includes(';')) {
      const parts = node.config.host.split(';');

      if (parts.length !== 2) {
        return rejectNode('invalid-vmess-host');
      }

      put(source, 'host', parts[0]);
      put(source, 'path', parts[1]);
    }

    const share = node.config;
    const rows: Binding[] = shareBindings.map((binding) =>
      binding.path === 'path' && share.net === 'grpc' ? { ...binding, field: 'grpcServiceName' } : binding,
    );

    return flatten('vmess', source, rows, ['v']);
  }

  if (node.scheme === 'mierus') {
    return mieruFields(node);
  }

  if (node.scheme === 'mieru') {
    return rejectNode('unsupported-mieru-uri');
  }

  const query = queryObject(node);

  if (node.scheme === 'wireguard') {
    return wireGuardFields(node, query);
  }

  if (node.scheme === 'ss') {
    assertCovered(query, ['plugin', 'group', 'remarks', 'udp', 'tfo', 'uot', 'udpOverTcp']);
    const plugin = get(query, 'plugin');
    const parts = plugin === undefined ? [] : text(plugin).split(';');

    const fields = one(
      ssTransform('fields', [
        {
          server: node.server,
          serverPort: Number(port(node.port)),
          method: node.username,
          password: node.password,
          remarks: node.name,
          ...(parts.length ? { plugin: parts[0], pluginOpts: parts.slice(1).join(';') } : {}),
          ...(get(query, 'group') !== undefined ? { group: base64(text(get(query, 'group'))) } : {}),
        },
      ]),
    );

    for (const [key, field] of [
      ['udp', 'udp'],
      ['tfo', 'tcpFastOpen'],
      ['uot', 'udpOverTcpEnabled'],
      ['udpOverTcp', 'udpOverTcpEnabled'],
    ] as const) {
      const value = get(query, key);

      if (value !== undefined) {
        put(fields, field, convert(value, 'boolean'));
      }
    }

    return fields;
  }

  const rawType =
    node.scheme === 'vmess1'
      ? 'vmess'
      : node.scheme === 'vless1'
        ? 'vless'
        : node.scheme === 'trojan-go'
          ? 'trojan'
          : ['socks', 'socks5h', 'tg'].includes(node.scheme)
            ? 'socks5'
            : node.scheme === 'hy'
              ? 'hysteria'
              : node.scheme === 'hy2' || node.scheme.includes('realm')
                ? 'hysteria2'
                : node.scheme.startsWith('naive+')
                  ? 'naive'
                  : node.scheme;
  const telegram = node.scheme === 'tg' || /^https:\/\/t\.me\/(?:socks|http)/i.test(node.raw ?? '');
  const telegramType = /(?:tg:\/\/|t\.me\/)http/i.test(node.raw ?? '') ? 'http' : 'socks5';
  const type = oneOf(
    'vmess',
    'vless',
    'trojan',
    'anytls',
    'http',
    'https',
    'socks5',
    'hysteria',
    'hysteria2',
    'tuic',
    'naive',
  )(telegram ? telegramType : rawType);

  if (telegram) {
    remove(query, 'server', 'port', 'user', 'pass');
  }

  if (node.scheme === 'tg' && node.server === '') {
    return rejectNode('invalid-telegram-node');
  }

  const source = {
    name: node.name,
    server: node.server,
    port: node.port ?? (type === 'https' ? 443 : type === 'http' ? 80 : undefined),
    username: node.username,
    password: node.password,
    query,
    ports: node.ports,
  };

  if (!telegram && node.path && node.path !== '/') {
    put(query, 'path', node.path);
  }

  if (['trojan', 'anytls', 'hysteria2'].includes(type)) {
    put(source, 'username', node.password ? `${node.username}:${node.password}` : node.username);
    remove(source, 'password');
  } else if (['vmess', 'vless'].includes(type)) {
    if (type === 'vmess' && node.password) {
      put(query, 'encryption', node.username);
      put(source, 'username', node.password);
    } else if (node.password) {
      return rejectNode('invalid-uri-credentials');
    }

    remove(source, 'password');
  } else {
    if (!node.username) {
      remove(source, 'username');
    }

    if (!node.password) {
      remove(source, 'password');
    }
  }

  if (type === 'tuic' && !node.password && node.username) {
    put(query, 'token', node.username);
    remove(source, 'username');
  }

  if (type !== 'hysteria2' && node.ports !== undefined) {
    return rejectNode('unsupported-port-hopping');
  }

  const security = get(query, 'security');
  const tls = security === undefined ? undefined : security === 'reality' ? true : convert(security, 'tlsMode');

  const group = get(query, 'group');

  remove(query, 'security', 'remarks', 'group');
  const defaults = ['trojan', 'anytls', 'hysteria', 'hysteria2', 'tuic', 'naive', 'https'].includes(type)
    ? { tls: true }
    : {};

  if (group !== undefined) {
    put(defaults, 'group', text(group));
  }

  if (tls !== undefined) {
    put(defaults, 'tls', tls);
  }

  if (security === 'reality') {
    put(defaults, 'realityEnabled', true);
  }

  if (type === 'naive') {
    put(defaults, 'naiveQuic', node.scheme === 'naive+quic');
  }

  const result = flatten(type, source, bindings[type], [], defaults);

  return result;
}

function queryEntries(value: unknown): [string, string][] {
  return value === undefined ? [] : Object.entries(object(value)).map(([key, item]) => [key, text(item)]);
}

function toNode(fields: ProxyNodeFields): UriNode {
  if (fields.type === 'ssr') {
    const portable = { ...fields };

    remove(portable, 'udp', 'tcpFastOpen');

    return { scheme: 'ssr', config: one(ssrTransform('node', [portable])), query: [] };
  }

  if (fields.type === 'ss') {
    const portable = { ...fields };

    remove(portable, 'udp', 'tcpFastOpen', 'udpOverTcpEnabled', 'udpOverTcpVersion');
    const node = one(ssTransform('node', [portable]));
    let plugin = node.plugin;
    let options = node.pluginOpts ?? '';

    if (isSimpleObfs(plugin)) {
      plugin = 'simple-obfs';
    }

    if (plugin === 'v2ray-plugin') {
      const aliases = [
        ...(fields.pluginMode ? [`obfs=${escapeOption(fields.pluginMode)}`] : []),
        ...(fields.pluginHost ? [`obfs-host=${escapeOption(fields.pluginHost)}`] : []),
      ];

      options = [...aliases, options].filter(Boolean).join(';');
    }

    const query: [string, string][] = plugin ? [['plugin', `${plugin}${options ? `;${options}` : ''}`]] : [];

    for (const [field, parameter] of [
      ['udp', 'udp'],
      ['udpOverTcpEnabled', 'uot'],
      ['tcpFastOpen', 'tfo'],
    ] as const) {
      if (fields[field] !== undefined) {
        query.push([parameter, fields[field] ? '1' : '0']);
      }
    }

    if (node.group !== undefined) {
      query.push(['group', Buffer.from(node.group).toString('base64')]);
    }

    return {
      scheme: 'ss',
      name: fields.name,
      server: node.server,
      port: Number(node.serverPort),
      username: node.method,
      password: node.password,
      path: '',
      query,
    };
  }

  if (fields.type === 'vmess' && !fields.realityEnabled && !fields.realityPublicKey) {
    const rows: Binding[] = shareBindings.map((binding) =>
      binding.path === 'path' && fields.network === 'grpc' ? { ...binding, field: 'grpcServiceName' } : binding,
    );

    const fingerprint = nativeFingerprint(fields);
    const fixed = { ...fingerprint.fixed };

    for (const field of ['udp', 'tcpFastOpen', 'allowInsecure'] as const) {
      if (get(fields, field) !== undefined) {
        put(fixed, field, get(fields, field));
      }
    }

    const config = expand(fields, rows, { v: '2', fp: fingerprint.value }, fixed);

    put(config, 'port', String(fields.port));
    if (fields.tls !== undefined) {
      put(config, 'tls', fields.tls ? 'tls' : '');
    }

    if (fields.network === 'http') {
      put(config, 'net', 'tcp');
      put(config, 'type', 'http');
    }

    return {
      scheme: 'vmess',
      config: vmessShareNode(config),
    };
  }

  if (fields.type === 'wireguard') {
    assertCovered(fields, ['type', 'name', 'privateKey', 'localAddresses', 'wireGuardPeers', 'mtu']);
    const peer = one(fields.wireGuardPeers);

    assertCovered(peer, ['server', 'port', 'publicKey', 'preSharedKey', 'reserved']);
    const query: [string, string][] = [
      ['publickey', text(peer.publicKey)],
      ['address', fields.localAddresses.join(',')],
    ];

    if (peer.preSharedKey !== undefined) {
      query.push(['presharedkey', peer.preSharedKey]);
    }

    if (peer.reserved !== undefined) {
      query.push(['reserved', peer.reserved.join(',')]);
    }

    if (fields.mtu !== undefined) {
      query.push(['mtu', String(fields.mtu)]);
    }

    return {
      scheme: 'wireguard',
      name: fields.name,
      server: text(peer.server),
      port: Number(port(peer.port)),
      username: fields.privateKey,
      password: '',
      path: '',
      query,
    };
  }

  if (fields.type === 'mieru') {
    assertCovered(fields, [
      'type',
      'name',
      'server',
      'port',
      'username',
      'password',
      'ports',
      'network',
      'mieruProfile',
      'mtu',
      'multiplexing',
      'mieruHandshakeMode',
      'mieruTrafficPattern',
    ]);
    const query: [string, string][] = [['profile', fields.mieruProfile ?? fields.name]];

    for (const range of fields.ports ?? [String(fields.port)]) {
      query.push(['port', range], ['protocol', fields.network ?? 'TCP']);
    }
    for (const [key, value] of [
      ['mtu', fields.mtu],
      ['multiplexing', fields.multiplexing],
      ['handshake-mode', fields.mieruHandshakeMode],
      ['traffic-pattern', fields.mieruTrafficPattern],
    ]) {
      if (value !== undefined) {
        query.push([String(key), String(value)]);
      }
    }

    return {
      scheme: 'mierus',
      name: fields.name,
      server: fields.server,
      username: fields.username,
      password: fields.password,
      path: '',
      query,
    };
  }

  if (
    ![
      'vmess',
      'vless',
      'trojan',
      'http',
      'https',
      'socks5',
      'hysteria',
      'hysteria2',
      'tuic',
      'anytls',
      'naive',
    ].includes(fields.type)
  ) {
    return rejectNode('unsupported-protocol');
  }

  const type = oneOf(
    'vmess',
    'vless',
    'trojan',
    'http',
    'https',
    'socks5',
    'hysteria',
    'hysteria2',
    'tuic',
    'anytls',
    'naive',
  )(fields.type);
  const fixed = {
    ...(['trojan', 'anytls', 'hysteria', 'hysteria2', 'tuic', 'naive', 'https'].includes(type) ? { tls: true } : {}),
  };
  const fingerprint = nativeFingerprint(fields);

  for (const field of ['udp', 'tcpFastOpen'] as const) {
    if (get(fields, field) !== undefined) {
      put(fixed, field, get(fields, field));
    }
  }

  for (const [key, value] of Object.entries(fingerprint.fixed)) {
    put(fixed, key, value);
  }
  const tls = get(fields, 'tls');

  if (tls !== undefined) {
    put(fixed, 'tls', tls);
  }

  if (type === 'naive') {
    put(fixed, 'naiveQuic', get(fields, 'naiveQuic'));
  }

  const reality = get(fields, 'realityEnabled');

  if (reality !== undefined) {
    put(fixed, 'realityEnabled', Boolean(get(fields, 'realityPublicKey')));
  }

  const output = expand(fields, [...bindings[type], { path: 'query.group', field: 'group' }], {}, fixed);
  const query = queryEntries(get(output, 'query'));

  if (type === 'anytls' && get(fields, 'udp') !== undefined) {
    query.push(['udp', get(fields, 'udp') ? '1' : '0']);
  }

  if (fingerprint.value !== undefined && !query.some(([key]) => key === 'fp' || key === 'fingerprint')) {
    query.push(['fp', fingerprint.value]);
  }

  const nativeScheme = type === 'naive' ? (get(fields, 'naiveQuic') ? 'naive+quic' : 'naive+https') : type;

  if (reality === true) {
    query.push(['security', 'reality']);
  } else if (['vmess', 'vless', 'http', 'trojan'].includes(type) && tls !== undefined) {
    query.push(['security', tls ? 'tls' : 'none']);
  }

  if (type === 'tuic' && get(fields, 'token')) {
    put(output, 'username', get(fields, 'token'));
  }

  return readNode({
    scheme: nativeScheme,
    name: fields.name,
    server: text(get(output, 'server')),
    port: Number(port(get(output, 'port'))),
    username: text(get(output, 'username') ?? ''),
    password: text(get(output, 'password') ?? ''),
    path: '',
    query,
    ...(get(output, 'ports') !== undefined ? { ports: get(output, 'ports') } : {}),
  });
}

export const transform = createTransform({ provider: 'uri', supports, readNode, toFields, toNode });
