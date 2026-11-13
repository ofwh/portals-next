import { computed, fallback, field, host, literal, mbps, pluginOptions, quoted, seconds, text } from '../../shared';
import { base, firstAddress, plainXray, validWireguard } from '../../shared/ini';
import type { NodeDefinition, NodeModule, NodeSchema, NodeSource } from '../../types';

// https://github.com/Loon0x00/LoonManual/blob/master/docs/cn/node.md
// https://github.com/Loon0x00/LoonExampleConfig/blob/master/Nodes/ExampleNodes.list
function tlsActive(node: Readonly<NodeSource>): boolean {
  return !!node.realityPublicKey || (node.tls ?? ['https', 'trojan', 'hysteria2', 'anytls'].includes(node.protocol));
}

const tls: NodeSchema = {
  sni: field('serverName', { when: (_, node) => tlsActive(node) }),
  'tls-profile': field('fingerprint', {
    when: (value, node) =>
      tlsActive(node) &&
      node.protocol !== 'hysteria2' &&
      ['global', 'default', 'safari-ios18', 'safari-ios-26', 'chrome', 'chrome147'].includes(String(value)),
  }),
  'tls-cert-sha256': field('certificatePin', { when: (_, node) => tlsActive(node) }),
  'skip-cert-verify': field('allowInsecure', { when: (_, node) => tlsActive(node) }),
};
const shadowTls: NodeSchema = {
  'shadow-tls-password': text('shadowTlsPassword'),
  'shadow-tls-sni': text('shadowTlsSni'),
  'shadow-tls-version': 'shadowTlsVersion',
  'udp-port': 'snellUdpPort',
};
const reality: NodeSchema = {
  'public-key': field('realityPublicKey', { transform: (value) => `"${String(value)}"` }),
  'short-id': text('realityShortId'),
};
const transport: NodeSchema = {
  transport: fallback('transport', 'tcp'),
  path: field('path', { default: '', when: (_, node) => ['ws', 'http'].includes(node.transport ?? '') }),
  host: field('host', { default: '', when: (_, node) => ['ws', 'http'].includes(node.transport ?? '') }),
};
const account: NodeSchema = {
  username: {
    ...quoted('username'),
    when: (_: unknown, node: Readonly<NodeSource>) => !!(node.username || node.password),
  },
  password: {
    ...quoted('password'),
    when: (_: unknown, node: Readonly<NodeSource>) => !!(node.username || node.password),
  },
};

function definition(
  fields: NodeSchema,
  positional: readonly string[] = [],
  when?: NodeDefinition['when'],
  endpoint = true,
): NodeDefinition {
  return {
    schema: {
      ...base,
      ...fields,
      'fast-open': field('tcpFastOpen', { when: (_, node) => !['wireguard', 'hysteria2'].includes(node.protocol) }),
      udp: 'udp',
    },
    positional,
    when,
    endpoint,
  };
}

function xray(node: Readonly<NodeSource>): boolean {
  return (
    plainXray(node) &&
    ['tcp', 'ws', 'http'].includes(node.transport ?? 'tcp') &&
    (!node.packetEncoding || node.packetEncoding === 'none') &&
    (node.protocol !== 'vless' || !node.encryption || node.encryption === 'none') &&
    (node.protocol !== 'trojan' || node.tls !== false) &&
    (node.protocol !== 'trojan' || (node.transport ?? 'tcp') !== 'http') &&
    (!node.flow || (node.flow === 'xtls-rprx-vision' && (node.transport ?? 'tcp') === 'tcp' && tlsActive(node))) &&
    (node.protocol !== 'vmess' ||
      !node.encryption ||
      ['none', 'auto', 'aes-128-cfb', 'aes-128-gcm', 'chacha20-poly1305', 'chacha20-ietf-poly1305'].includes(
        node.encryption,
      ))
  );
}

export const schema: NodeModule['nodes'] = {
  ss: definition(
    {
      type: literal('Shadowsocks'),
      encryption: 'encryption',
      password: quoted('password'),
      ...shadowTls,
      'obfs-name': computed((node) => pluginOptions(node).obfs),
      'obfs-host': computed((node) => pluginOptions(node)['obfs-host']),
      'obfs-uri': computed((node) => pluginOptions(node)['obfs-uri']),
      'udp-over-tcp': 'uot',
    },
    ['encryption', 'password'],
    (node) => !node.plugin || ['simple-obfs', 'obfs-local'].includes(node.plugin),
  ),
  ssr: definition(
    {
      type: literal('ShadowsocksR'),
      encryption: 'encryption',
      password: quoted('password'),
      ...shadowTls,
      protocol: 'ssrProtocol',
      'protocol-param': text('ssrProtocolParam'),
      obfs: 'obfs',
      'obfs-param': text('obfsParam'),
    },
    ['encryption', 'password'],
  ),
  vmess: definition(
    {
      type: literal('VMess'),
      encryption: field('encryption', {
        transform: (value) => (value === 'chacha20-poly1305' ? 'chacha20-ietf-poly1305' : value),
      }),
      uuid: quoted('uuid'),
      ...transport,
      alterId: fallback('alterId', 0),
      'over-tls': computed(tlsActive),
      ...tls,
      ...reality,
      ...shadowTls,
    },
    ['encryption', 'uuid'],
    xray,
  ),
  vless: definition(
    {
      type: literal('VLESS'),
      uuid: quoted('uuid'),
      ...transport,
      flow: text('flow'),
      'over-tls': computed(tlsActive),
      ...tls,
      ...reality,
      ...shadowTls,
    },
    ['uuid'],
    xray,
  ),
  trojan: definition(
    {
      type: literal('Trojan'),
      password: quoted('password'),
      ...transport,
      ...tls,
      ...reality,
      alpn: field('alpn', {
        when: (_, node) => !!node.alpn?.length,
        transform: (_, node) => `"${node.alpn?.join(',')}"`,
      }),
    },
    ['password'],
    xray,
  ),
  http: definition({ type: computed((node) => (node.tls ? 'https' : 'http')), ...account, ...tls, ...shadowTls }, [
    'username',
    'password',
  ]),
  https: definition(
    {
      type: computed((node) => (node.tls === false ? 'http' : 'https')),
      ...account,
      ...tls,
    },
    ['username', 'password'],
  ),
  socks5: definition(
    {
      ...account,
      'over-tls': fallback('tls', false),
      ...tls,
      ...shadowTls,
    },
    ['username', 'password'],
  ),
  anytls: definition(
    {
      type: literal('AnyTLS'),
      password: quoted('password'),
      ...tls,
      ...reality,
      'idle-session-timeout': 'idleSessionTimeoutSeconds',
    },
    ['password'],
    (node) => node.tls !== false,
  ),
  hysteria2: definition(
    {
      type: literal('Hysteria2'),
      password: quoted('password'),
      ...tls,
      alpn: field('alpn', {
        when: (_, node) => !!node.alpn?.length,
        transform: (_, node) => `"${node.alpn?.join(',')}"`,
      }),
      'download-bandwidth': computed((node) => mbps(node.down)),
      'salamander-password': field('obfsPassword', { when: (_, node) => node.obfs === 'salamander' }),
      'server-ports': field('portRanges', {
        when: (_, node) => !!node.portRanges?.length,
        transform: (_, node) => `"${node.portRanges?.join(',')}"`,
      }),
      'hop-interval': computed((node) => seconds(node.hopInterval)),
    },
    ['password'],
    (node) =>
      !node.realmUrl && node.tls !== false && (!node.obfs || (node.obfs === 'salamander' && !!node.obfsPassword)),
  ),
  wireguard: definition(
    {
      type: literal('WireGuard'),
      server: field('server', { when: () => false }),
      port: field('port', { when: () => false }),
      'interface-ip': computed((node) => firstAddress(node, 4)),
      'interface-ipv6': computed((node) => firstAddress(node, 6)),
      'private-key': quoted('privateKey'),
      dns: computed((node) => firstAddress(node, 4, true)),
      dnsv6: computed((node) => firstAddress(node, 6, true)),
      mtu: 'mtu',
      keepalive: 'keepAlive',
      peers: computed(
        (node) =>
          `[{public-key="${node.publicKey}",${node.preSharedKey ? `preshared-key="${node.preSharedKey}",` : ''}allowed-ips="${node.allowedIPs?.join(',') || '0.0.0.0/0,::/0'}",endpoint=${host(node.server)}:${node.port}${node.reserved?.length ? `,reserved=[${node.reserved.join(',')}]` : ''}}]`,
      ),
    },
    [],
    validWireguard,
    false,
  ),
};
