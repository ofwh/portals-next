import { ipVersion } from '@chainsafe/is-ip';
import { computed, fallback, field, host, literal, mbps, object, seconds, text } from '../../shared';
import { base, validWireguard, wireguardInterface } from '../../shared/ini';
import type { NodeDefinition, NodeModule, NodeSchema, NodeSource } from '../../types';

const wireguardSection: NodeSchema = {
  ...wireguardInterface,
  peer: computed(
    (node) =>
      `(public-key=${node.publicKey},${node.preSharedKey ? `preshared-key=${node.preSharedKey},` : ''}allowed-ips="${node.allowedIPs?.join(',') || '0.0.0.0/0, ::/0'}",endpoint=${host(node.server)}:${node.port}${node.reserved?.length ? `,client-id=${node.reserved.join('/')}` : ''}${node.keepAlive ? `,keepalive=${node.keepAlive}` : ''})`,
  ),
};

// https://manual.nssurge.com/policies/overview.html
function tlsActive(node: Readonly<NodeSource>): boolean {
  return (
    !!node.realityPublicKey || (node.tls ?? ['https', 'trojan', 'hysteria2', 'tuic', 'anytls'].includes(node.protocol))
  );
}

const tls: NodeSchema = {
  'skip-cert-verify': field('allowInsecure', { when: (_, node) => tlsActive(node) && !node.realityPublicKey }),
  sni: computed((node) => (tlsActive(node) ? (node.disableSni ? 'off' : node.serverName || undefined) : undefined)),
  'server-cert-fingerprint-sha256': field('certificatePin', {
    when: (_, node) => tlsActive(node) && !node.realityPublicKey,
  }),
  alpn: field('alpn', {
    when: (_, node) => tlsActive(node) && !!node.alpn?.length,
    transform: (_, node) => `"${node.alpn?.join(',')}"`,
  }),
};
const relay: NodeSchema = {
  tfo: 'tcpFastOpen',
  'udp-relay': field('udp', {
    when: (_, node) =>
      ['ss', 'socks5'].includes(node.protocol) || (node.protocol === 'snell' && (node.snellVersion ?? 1) >= 3),
  }),
  'underlying-proxy': text('underlyingProxy'),
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
  'port-hopping-interval': computed((node) => seconds(node.hopInterval)),
  'port-hopping': field('portRanges', {
    when: (_, node) =>
      !!node.portRanges?.length && (node.portRanges.length > 1 || node.portRanges[0] !== String(node.port)),
    transform: (_, node) => node.portRanges?.join(';'),
  }),
};

function definition(
  fields: NodeSchema,
  when?: NodeDefinition['when'],
  options: Pick<NodeDefinition, 'endpoint' | 'positional'> = {},
): NodeDefinition {
  return {
    schema: { ...base, ...fields, ...relay, 'test-url': text('testUrl') },
    when: (node) => (!node.realityPublicKey || node.protocol === 'vless') && (!when || when(node)),
    ...options,
  };
}

function quic(node: Readonly<NodeSource>): boolean {
  return node.tls !== false && !node.realityPublicKey && !node.ech;
}

function snell(node: Readonly<NodeSource>): boolean {
  const version = node.snellVersion ?? 1;
  const shadow = node.shadowTlsVersion;

  return (
    !!node.password &&
    Number.isInteger(version) &&
    version >= 1 &&
    version <= 6 &&
    (!node.obfs || ['http', 'tls', 'shadow-tls'].includes(node.obfs)) &&
    !(version >= 4 && node.obfs === 'tls') &&
    !(version === 6 && (node.obfs || node.host || node.path)) &&
    (!node.path || node.obfs === 'http') &&
    (!node.snellMode || version === 6) &&
    (node.snellUdpPort === undefined ||
      (Number.isInteger(node.snellUdpPort) && node.snellUdpPort > 0 && node.snellUdpPort <= 65535 && version >= 3)) &&
    (!(node.shadowTlsPassword || node.shadowTlsSni || shadow !== undefined) ||
      (!!node.shadowTlsPassword &&
        (!node.obfs || node.obfs === 'shadow-tls') &&
        (shadow === undefined || shadow === 2 || shadow === 3) &&
        (shadow !== 3 || !!node.shadowTlsSni)))
  );
}

export const schema: NodeModule['nodes'] = {
  ss: definition(
    {
      'encrypt-method': 'encryption',
      password: 'password',
      obfs: computed((node) => node.pluginOptions?.find((value) => value.startsWith('obfs='))?.slice(5)),
      'obfs-host': computed((node) => node.pluginOptions?.find((value) => value.startsWith('obfs-host='))?.slice(10)),
    },
    (node) => !node.plugin || ['simple-obfs', 'obfs-local'].includes(node.plugin),
  ),
  socks5: definition({
    type: computed((node) => (node.tls ? 'socks5-tls' : 'socks5')),
    username: text('username'),
    password: text('password'),
    ...tls,
  }),
  http: definition({
    username: text('username'),
    password: text('password'),
    type: computed((node) => (node.tls ? 'https' : 'http')),
    ...tls,
  }),
  https: definition({
    type: computed((node) => (node.tls === false ? 'http' : 'https')),
    username: text('username'),
    password: text('password'),
    ...tls,
  }),
  vmess: definition(
    {
      username: 'uuid',
      tls: fallback('tls', false),
      'vmess-aead': computed((node) => !node.alterId),
      ...websocket,
      ...tls,
      'encrypt-method': field('encryption', {
        transform: (value) => (value === 'chacha20-poly1305' ? 'chacha20-ietf-poly1305' : value),
        when: (value) => ['aes-128-gcm', 'chacha20-poly1305', 'chacha20-ietf-poly1305'].includes(String(value)),
      }),
    },
    (node) =>
      ['tcp', 'ws'].includes(node.transport ?? 'tcp') &&
      !!node.uuid &&
      (!node.encryption ||
        ['auto', 'aes-128-gcm', 'chacha20-poly1305', 'chacha20-ietf-poly1305'].includes(node.encryption)) &&
      !node.realityPublicKey &&
      !node.ech &&
      (!node.headerType || node.headerType === 'none'),
  ),
  trojan: definition(
    {
      password: 'password',
      ...tls,
      ...websocket,
    },
    (node) =>
      !!node.password &&
      ['tcp', 'ws'].includes(node.transport ?? 'tcp') &&
      node.tls !== false &&
      !node.realityPublicKey &&
      !node.ech &&
      !node.plugin &&
      !node.encryption,
  ),
  vless: definition(
    {
      username: 'uuid',
      encryption: literal('none'),
      tls: computed((node) => !!node.realityPublicKey || node.tls === true),
      flow: text('flow'),
      'reality-public-key': text('realityPublicKey'),
      'reality-short-id': text('realityShortId'),
      ...tls,
      ...websocket,
      grpc: field('transport', { when: (value) => value === 'grpc', transform: () => true }),
      'grpc-service-name': computed((node) =>
        node.transport === 'grpc' ? (node.serviceName ?? node.path ?? '') : undefined,
      ),
      'grpc-mode': field('mode', { when: (_, node) => node.transport === 'grpc' }),
      'grpc-authority': field('xrayAuthority', { when: (_, node) => node.transport === 'grpc' }),
    },
    (node) =>
      !!node.uuid &&
      (!node.encryption || node.encryption === 'none') &&
      ['tcp', 'ws', 'grpc'].includes(node.transport ?? 'tcp') &&
      !(node.realityPublicKey && node.transport === 'ws') &&
      (node.transport !== 'grpc' || !node.mode || ['gun', 'multi'].includes(node.mode)) &&
      (!node.flow ||
        (['xtls-rprx-vision', 'xtls-rprx-vision-udp443'].includes(node.flow) &&
          (node.transport ?? 'tcp') === 'tcp' &&
          (!!node.tls || !!node.realityPublicKey))) &&
      (node.transport !== 'grpc' || !!node.tls || !!node.realityPublicKey),
  ),
  wireguard: definition(
    {
      server: field('server', { when: () => false }),
      port: field('port', { when: () => false }),
      'section-name': 'sectionName',
      'test-url': text('testUrl'),
      section: object(wireguardSection),
    },
    validWireguard,
    { endpoint: false },
  ),
  hysteria2: definition(
    {
      password: 'password',
      'download-bandwidth': computed((node) => mbps(node.down)),
      ...tls,
      'salamander-password': field('obfsPassword', { when: (_, node) => node.obfs === 'salamander' }),
      'gecko-password': field('obfsPassword', { when: (_, node) => node.obfs === 'gecko' }),
      ...hopping,
    },
    (node) =>
      quic(node) &&
      !!node.password &&
      !(node.underlyingProxy && node.portRanges?.some((range) => range !== String(node.port))) &&
      !node.realmUrl &&
      !node.realmToken &&
      node.minPacketSize === undefined &&
      node.maxPacketSize === undefined &&
      (!(node.obfs || node.obfsPassword) || (!!node.obfsPassword && ['salamander', 'gecko'].includes(node.obfs ?? ''))),
  ),
  tuic: definition(
    {
      type: computed((node) => (node.token ? 'tuic' : 'tuic-v5')),
      token: text('token'),
      uuid: field('uuid', { when: (_, node) => !node.token }),
      password: field('password', { when: (_, node) => !node.token }),
      ...tls,
      ...hopping,
    },
    (node) =>
      quic(node) &&
      (!!node.token || (!!node.uuid && !!node.password)) &&
      !(node.underlyingProxy && node.portRanges?.some((range) => range !== String(node.port))),
  ),
  anytls: definition(
    { password: 'password', ...tls, 'udp-relay': field('udp', { when: () => false }) },
    (node) => quic(node) && !!node.password,
  ),
  snell: definition(
    {
      psk: 'password',
      obfs: field('obfs', { when: (value) => value === 'http' || value === 'tls' }),
      'obfs-host': field('host', { when: (_, node) => !!node.host && (node.obfs === 'http' || node.obfs === 'tls') }),
      'obfs-uri': text('path'),
      version: fallback('snellVersion', 1),
      reuse: 'snellReuse',
      'udp-port': 'snellUdpPort',
      mode: text('snellMode'),
      'shadow-tls-password': text('shadowTlsPassword'),
      'shadow-tls-sni': text('shadowTlsSni'),
      'shadow-tls-version': 'shadowTlsVersion',
    },
    snell,
  ),
  ssr: definition(
    {
      type: literal('external'),
      server: field('server', { when: () => false }),
      port: field('port', { when: () => false }),
      exec: computed((node) => `"${ssrPath(node)}"`),
      args: computed((node) => ssrArguments(node)),
      'local-port': computed((node) => 1080 + node.index),
      addresses: field('server', { when: (value) => typeof value === 'string' && !!ipVersion(value) }),
    },
    (node) =>
      !!ssrPath(node) &&
      1080 + node.index <= 65535 &&
      !!node.encryption &&
      !!node.password &&
      !!node.obfs &&
      !!node.ssrProtocol,
    { endpoint: false },
  ),
};

function ssrArguments(node: Readonly<NodeSource>): string[] {
  return [
    '-l',
    String(1080 + node.index),
    '-s',
    node.server,
    '-p',
    String(node.port),
    '-m',
    node.encryption ?? '',
    '-k',
    node.password ?? '',
    '-o',
    node.obfs ?? '',
    '-O',
    node.ssrProtocol ?? '',
    ...(node.obfsParam ? ['-g', node.obfsParam] : []),
    ...(node.ssrProtocolParam ? ['-G', node.ssrProtocolParam] : []),
  ];
}

function ssrPath(node: Readonly<NodeSource>): string | undefined {
  const path = node.options?.surgeSsrPath;

  return typeof path === 'string' && !/["\\\x00-\x1f\x7f]/.test(path) ? path : undefined;
}
