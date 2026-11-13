import { computed, fallback, field, host, literal, mbps, object, pluginOptions, seconds, text } from '../../shared';
import { base, validWireguard, wireguardInterface } from '../../shared/ini';
import type { NodeDefinition, NodeModule, NodeSchema, NodeSource } from '../../types';

// https://getsurfboard.com/docs/profile-format/proxy/
function tlsActive(node: Readonly<NodeSource>): boolean {
  return node.tls ?? ['https', 'trojan', 'hysteria2', 'tuic', 'anytls'].includes(node.protocol);
}

const tls: NodeSchema = {
  'skip-cert-verify': field('allowInsecure', { when: (_, node) => tlsActive(node) }),
  sni: field('serverName', { when: (_, node) => tlsActive(node) }),
  'server-cert-fingerprint-sha256': field('certificatePin', { when: (_, node) => tlsActive(node) }),
};
const websocket: NodeSchema = {
  ws: field('transport', { when: (value) => value === 'ws', transform: () => true }),
  'ws-path': field('path', { default: '/', when: (_, node) => node.transport === 'ws' }),
  'ws-headers': computed((node) =>
    node.transport === 'ws'
      ? [node.host ? `Host:${node.host}` : '', node.edge ? `Edge:${node.edge}` : ''].filter(Boolean).join('|') ||
        undefined
      : undefined,
  ),
};
const hopping: NodeSchema = {
  'port-hopping': field('portRanges', {
    when: (_, node) => !!node.portRanges?.length,
    transform: (_, node) => `"${node.portRanges?.join(';')}"`,
  }),
  'port-hopping-interval': computed((node) => seconds(node.hopInterval)),
};

function definition(fields: NodeSchema, options: Omit<NodeDefinition, 'schema'> = {}): NodeDefinition {
  return {
    schema: { ...base, ...fields, 'underlying-proxy': text('underlyingProxy') },
    ...options,
    when: (node) =>
      !node.realityPublicKey &&
      !(node.tls === false && ['trojan', 'hysteria2', 'tuic', 'anytls'].includes(node.protocol)) &&
      (!options.when || options.when(node)),
  };
}

function plainTransport(node: Readonly<NodeSource>): boolean {
  return ['tcp', 'ws'].includes(node.transport ?? 'tcp') && !node.realityPublicKey && !node.ech;
}

export const schema: NodeModule['nodes'] = {
  ss: definition(
    {
      'encrypt-method': 'encryption',
      password: 'password',
      'udp-relay': 'udp',
      obfs: computed((node) => pluginOptions(node).obfs),
      'obfs-host': computed((node) => pluginOptions(node)['obfs-host']),
      'obfs-uri': computed((node) => pluginOptions(node)['obfs-uri']),
    },
    { when: (node) => !node.plugin || ['simple-obfs', 'obfs-local'].includes(node.plugin) },
  ),
  socks5: definition(
    {
      type: computed((node) => (node.tls ? 'socks5-tls' : 'socks5')),
      username: fallback('username', ''),
      password: fallback('password', ''),
      'udp-relay': 'udp',
      ...tls,
    },
    { positional: ['username', 'password'] },
  ),
  http: definition(
    {
      type: computed((node) => (node.tls ? 'https' : 'http')),
      username: fallback('username', ''),
      password: fallback('password', ''),
      ...tls,
    },
    { positional: ['username', 'password'] },
  ),
  https: definition(
    {
      type: computed((node) => (node.tls === false ? 'http' : 'https')),
      username: fallback('username', ''),
      password: fallback('password', ''),
      ...tls,
    },
    { positional: ['username', 'password'] },
  ),
  vmess: definition(
    {
      username: 'uuid',
      tls: fallback('tls', false),
      'vmess-aead': computed((node) => !node.alterId),
      'encrypt-method': field('encryption', {
        when: (value) => ['aes-128-gcm', 'chacha20-poly1305', 'chacha20-ietf-poly1305'].includes(String(value)),
        transform: (value) => (value === 'chacha20-poly1305' ? 'chacha20-ietf-poly1305' : value),
      }),
      'udp-relay': 'udp',
      ...tls,
      ...websocket,
    },
    {
      when: (node) =>
        plainTransport(node) &&
        (!node.encryption ||
          ['auto', 'aes-128-gcm', 'chacha20-poly1305', 'chacha20-ietf-poly1305'].includes(node.encryption)),
    },
  ),
  trojan: definition(
    { password: 'password', 'udp-relay': 'udp', ...tls, ...websocket },
    { when: (node) => plainTransport(node) && node.tls !== false },
  ),
  wireguard: definition(
    {
      name: 'name',
      type: literal('wireguard'),
      server: field('server', { when: () => false }),
      port: field('port', { when: () => false }),
      'section-name': 'sectionName',
      section: object({
        ...wireguardInterface,
        peer: computed(
          (node) =>
            `(public-key=${node.publicKey},${node.preSharedKey ? `preshared-key=${node.preSharedKey},` : ''}allowed-ips="${node.allowedIPs?.join(',') || '0.0.0.0/0, ::/0'}",endpoint=${host(node.server)}:${node.port}${node.keepAlive !== undefined ? `,keepalive=${node.keepAlive}` : ''})`,
        ),
      }),
    },
    { endpoint: false, when: validWireguard },
  ),
  hysteria2: definition(
    {
      password: 'password',
      'download-bandwidth': computed((node) => mbps(node.down)),
      ...tls,
      ...hopping,
      'udp-relay': 'udp',
      'salamander-password': field('obfsPassword', { when: (_, node) => node.obfs === 'salamander' }),
      'gecko-password': field('obfsPassword', { when: (_, node) => node.obfs === 'gecko' }),
    },
    {
      when: (node) =>
        !node.realmUrl &&
        node.minPacketSize === undefined &&
        node.maxPacketSize === undefined &&
        (!(node.obfs || node.obfsPassword) ||
          (!!node.obfsPassword && ['salamander', 'gecko'].includes(node.obfs ?? ''))),
    },
  ),
  anytls: definition(
    { password: 'password', ...tls, 'udp-relay': 'udp' },
    { positional: ['password'], when: (node) => !node.realityPublicKey && node.tls !== false },
  ),
  tuic: definition(
    {
      type: literal('tuic-v5'),
      uuid: 'uuid',
      password: 'password',
      ...tls,
      ...hopping,
      'udp-relay': 'udp',
      alpn: field('alpn', { transform: (_, node) => `"${node.alpn?.join(',')}"` }),
    },
    { when: (node) => !node.token && !!node.uuid && !!node.password },
  ),
  snell: definition(
    {
      psk: 'password',
      version: fallback('snellVersion', 1),
      'udp-relay': field('udp', { when: (_, node) => (node.snellVersion ?? 1) >= 3 }),
      obfs: text('obfs'),
      'obfs-host': field('host', { when: (_, node) => !!node.obfs }),
      'obfs-uri': field('path', { when: (_, node) => node.obfs === 'http' }),
    },
    {
      when: (node) =>
        (node.snellVersion ?? 1) <= 4 &&
        !node.shadowTlsPassword &&
        !node.snellMode &&
        (!node.obfs || ['http', 'tls'].includes(node.obfs)),
    },
  ),
};
