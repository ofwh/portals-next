import { Buffer } from 'node:buffer';
import { ipVersion } from '@chainsafe/is-ip';
import { computed, fallback, field, literal, mbps, object, seconds, text } from '../../shared';
import { realm } from '../../shared/node';
import type { NodeDefinition, NodeModule, NodeSchema, NodeSource } from '../../types';
import { transform } from '../shared';

// https://sing-box.sagernet.org/configuration/outbound/
const tls: NodeSchema = {
  enabled: literal(true),
  server_name: text('serverName'),
  alpn: 'alpn',
  disable_sni: 'disableSni',
  // sing-box 1.15+，整张证书的 SHA-256，使用 Base64 编码。
  certificate_sha256: field('certificatePin', {
    transform: (value) => {
      const hex = String(value).replaceAll(':', '');

      return /^[a-f0-9]{64}$/i.test(hex) ? [Buffer.from(hex, 'hex').toString('base64')] : undefined;
    },
  }),
  insecure: fallback('allowInsecure', false),
  utls: object(
    { enabled: literal(true), fingerprint: 'fingerprint' },
    (node) => !!node.fingerprint && !['hysteria', 'hysteria2', 'tuic', 'naive'].includes(node.protocol),
  ),
  reality: object(
    { enabled: literal(true), public_key: text('realityPublicKey'), short_id: fallback('realityShortId', '') },
    (node) => !!(node.realityPublicKey || node.realityShortId),
  ),
};

function transportType(node: Readonly<NodeSource>): string {
  return node.transport === 'h2' || (node.transport === 'tcp' && node.headerType === 'http')
    ? 'http'
    : (node.transport ?? 'tcp');
}

function bandwidth(value: string | undefined): number | string | undefined {
  const rate = mbps(value);

  return rate !== undefined && rate > 0 ? rate : value && /^[1-9]\d*\s*[KMGT]?[bB]ps$/.test(value) ? value : undefined;
}

const base: NodeSchema = {
  type: 'protocol',
  tag: 'name',
  server: 'server',
  server_port: 'port',
  detour: text('underlyingProxy'),
  tcp_fast_open: 'tcpFastOpen',
};
const network: NodeSchema = { network: field('udp', { when: (value) => value === false, transform: () => 'tcp' }) };
const optionalTls: NodeSchema = { tls: object(tls, (node) => !!node.realityPublicKey || node.tls === true) };
const transport: NodeSchema = {
  transport: object(
    {
      type: computed(transportType),
      path: computed((node) =>
        ['ws', 'http', 'httpupgrade'].includes(transportType(node)) ? node.path || '/' : undefined,
      ),
      host: computed((node) =>
        transportType(node) === 'http'
          ? node.host
            ? [node.host]
            : undefined
          : transportType(node) === 'httpupgrade'
            ? (node.host ?? '')
            : undefined,
      ),
      headers: object({ Host: text('host'), Edge: text('edge') }, (node) => transportType(node) === 'ws'),
      service_name: computed((node) =>
        transportType(node) === 'grpc' ? node.serviceName || node.path || undefined : undefined,
      ),
    },
    (node) => transportType(node) !== 'tcp',
  ),
};
const xray: NodeSchema = {
  ...transport,
  ...network,
  ...optionalTls,
  uuid: fallback('uuid', ''),
  packet_encoding: field('packetEncoding', { transform: (value) => (value === 'none' ? '' : value) }),
};
const peerSchema: NodeSchema = {
  address: 'server',
  port: 'port',
  persistent_keepalive_interval: 'keepAlive',
  public_key: fallback('publicKey', ''),
  allowed_ips: fallback('allowedIPs', ['0.0.0.0/0', '::/0']),
  pre_shared_key: text('preSharedKey'),
  reserved: 'reserved',
};
const hopping: NodeSchema = {
  server_port: computed((node) =>
    !node.portRanges?.length
      ? node.port
      : node.protocol === 'hysteria2' && node.portRanges.length === 1 && /^\d+$/.test(node.portRanges[0])
        ? Number(node.portRanges[0])
        : undefined,
  ),
  server_ports: field('portRanges', {
    when: (_, node) =>
      !!node.portRanges?.length &&
      !(node.protocol === 'hysteria2' && node.portRanges.length === 1 && /^\d+$/.test(node.portRanges[0])),
    transform: (_, node) => node.portRanges?.map((range) => range.replace('-', ':')),
  }),
};

function definition(fields: NodeSchema, when?: NodeDefinition['when']): NodeDefinition {
  return { schema: { ...base, ...fields }, when };
}

function supportedXray(node: Readonly<NodeSource>): boolean {
  return (
    ['tcp', 'http', 'ws', 'grpc', 'httpupgrade', 'quic'].includes(transportType(node)) &&
    (!node.packetEncoding || ['none', 'packetaddr', 'xudp'].includes(node.packetEncoding)) &&
    (node.transport !== 'quic' || (!node.quicKey && (!node.quicSecurity || node.quicSecurity === 'none'))) &&
    (!node.flow || node.flow === 'xtls-rprx-vision')
  );
}

export const schema: NodeModule['nodes'] = {
  ss: definition(
    {
      ...network,
      udp_over_tcp: 'uot',
      type: literal('shadowsocks'),
      method: fallback('encryption', ''),
      password: fallback('password', ''),
      plugin: computed((node) =>
        node.plugin ? (node.plugin === 'simple-obfs' ? 'obfs-local' : node.plugin) : undefined,
      ),
      plugin_opts: field('pluginOptions', {
        when: (_, node) => !!node.plugin && !!node.pluginOptions?.length,
        transform: (_, node) => node.pluginOptions?.join(';'),
      }),
    },
    (node) => !node.plugin || ['simple-obfs', 'obfs-local', 'v2ray-plugin'].includes(node.plugin),
  ),
  vmess: definition({ ...xray, alter_id: fallback('alterId', 0), security: fallback('encryption', '') }, supportedXray),
  vless: definition(
    { ...xray, flow: text('flow') },
    (node) =>
      supportedXray(node) &&
      (!node.encryption || node.encryption === 'none') &&
      (!node.flow || ((node.transport ?? 'tcp') === 'tcp' && !!(node.tls || node.realityPublicKey))),
  ),
  trojan: definition(
    { ...transport, ...network, tls: object(tls, (node) => node.tls !== false), password: fallback('password', '') },
    supportedXray,
  ),
  http: definition({
    ...optionalTls,
    username: text('username'),
    password: text('password'),
    path: text('path'),
    headers: object({ Host: text('host') }),
  }),
  https: definition({
    type: literal('http'),
    tls: object(tls, (node) => node.tls !== false),
    username: text('username'),
    password: text('password'),
    path: text('path'),
    headers: object({ Host: text('host') }),
  }),
  socks5: definition(
    {
      ...network,
      udp_over_tcp: 'uot',
      type: literal('socks'),
      version: literal('5'),
      username: text('username'),
      password: text('password'),
    },
    (node) => !node.tls && !node.realityPublicKey,
  ),
  wireguard: {
    ...definition({
      server: field('server', { when: () => false }),
      server_port: field('port', { when: () => false }),
      address: field('addresses', {
        default: [],
        transform: (_, node) =>
          (node.addresses ?? []).map((address) =>
            address.includes('/') ? address : `${address}/${ipVersion(address) === 6 ? 128 : 32}`,
          ),
      }),
      private_key: fallback('privateKey', ''),
      peers: computed((node) => [transform(node, peerSchema)]),
      system: 'system',
      name: text('interfaceName'),
      listen_port: 'listenPort',
      workers: field('workers', { when: (value) => !!value }),
      mtu: field('mtu', { when: (value) => !!value }),
    }),
    collection: 'endpoints',
  },
  hysteria: definition(
    {
      ...hopping,
      ...network,
      up_mbps: computed((node) => (typeof bandwidth(node.up) === 'number' ? bandwidth(node.up) : undefined)),
      down_mbps: computed((node) => (typeof bandwidth(node.down) === 'number' ? bandwidth(node.down) : undefined)),
      up: computed((node) => (typeof bandwidth(node.up) === 'string' ? node.up : undefined)),
      down: computed((node) => (typeof bandwidth(node.down) === 'string' ? node.down : undefined)),
      auth_str: text('password'),
      obfs: text('obfsPassword'),
      hop_interval: computed((node) => {
        const interval = seconds(node.hopInterval);

        return interval === undefined ? undefined : `${interval}s`;
      }),
      tls: object(tls),
    },
    (node) =>
      bandwidth(node.up) !== undefined &&
      bandwidth(node.down) !== undefined &&
      (!node.network || node.network === 'udp') &&
      (!node.transport || node.transport === 'tcp') &&
      (!node.hopInterval || seconds(node.hopInterval) !== undefined),
  ),
  hysteria2: definition(
    {
      ...hopping,
      ...network,
      server: field('server', { when: (_, node) => !node.realmUrl }),
      server_port: computed((node) =>
        node.realmUrl
          ? undefined
          : !node.portRanges?.length
            ? node.port
            : node.portRanges.length === 1 && /^\d+$/.test(node.portRanges[0])
              ? Number(node.portRanges[0])
              : undefined,
      ),
      server_ports: field('portRanges', {
        when: (_, node) =>
          !node.realmUrl &&
          !!node.portRanges?.length &&
          !(node.portRanges.length === 1 && /^\d+$/.test(node.portRanges[0])),
        transform: (_, node) => node.portRanges?.map((range) => range.replace('-', ':')),
      }),
      realm: object(
        {
          server_url: computed((node) => realm(node)?.serverUrl),
          token: computed((node) => realm(node)?.token),
          realm_id: computed((node) => realm(node)?.id),
          stun_servers: computed((node) => realm(node)?.stunServers),
        },
        (node) => !!node.realmUrl,
      ),
      hop_interval: computed((node) => {
        const interval = seconds(node.hopInterval);

        return interval === undefined ? undefined : `${interval}s`;
      }),
      password: fallback('password', ''),
      up_mbps: computed((node) => mbps(node.up)),
      down_mbps: computed((node) => mbps(node.down)),
      obfs: object(
        {
          type: 'obfs',
          password: text('obfsPassword'),
          min_packet_size: field('minPacketSize', { when: (_, node) => node.obfs === 'gecko' }),
          max_packet_size: field('maxPacketSize', { when: (_, node) => node.obfs === 'gecko' }),
        },
        (node) => !!node.obfs,
      ),
      tls: object(tls),
    },
    (node) =>
      (!node.realmUrl || !!realm(node)?.stunServers.length) &&
      (!node.obfs || ['salamander', 'gecko'].includes(node.obfs)),
  ),
  tuic: definition(
    {
      ...network,
      uuid: 'uuid',
      password: 'password',
      tls: object(tls),
      congestion_control: text('congestionControl'),
      udp_relay_mode: text('udpRelayMode'),
      zero_rtt_handshake: 'reduceRtt',
    },
    (node) => !!node.uuid && !!node.password,
  ),
  naive: definition({
    username: text('username'),
    password: 'password',
    insecure_concurrency: 'insecureConcurrency',
    udp_over_tcp: 'uot',
    quic: computed((node) =>
      node.transport === 'quic' || node.transport === 'https' ? node.transport === 'quic' : false,
    ),
    tls: object({ enabled: literal(true), server_name: text('serverName') }),
  }),
  anytls: definition({
    password: fallback('password', ''),
    tls: object(tls),
    idle_session_check_interval: field('idleSessionCheckIntervalSeconds', {
      when: (value) => value !== 30,
      transform: (value) => `${value}s`,
    }),
    idle_session_timeout: field('idleSessionTimeoutSeconds', {
      when: (value) => value !== 30,
      transform: (value) => `${value}s`,
    }),
    min_idle_session: field('minIdleSession', { when: (value) => !!value }),
  }),
};
