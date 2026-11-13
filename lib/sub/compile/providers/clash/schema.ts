import { ipVersion } from '@chainsafe/is-ip';
import { computed, fallback, field, literal, object, pluginOptions, seconds, text } from '../../shared';
import { realm } from '../../shared/node';
import type { NodeDefinition, NodeModule, NodeSchema, NodeSource } from '../../types';

// https://wiki.metacubex.one/config/proxies/
const base: NodeSchema = {
  name: 'name',
  server: 'server',
  port: 'port',
  type: 'protocol',
  udp: field('udp', { when: (_, node) => !['http', 'https', 'hysteria', 'hysteria2', 'tuic'].includes(node.protocol) }),
  tfo: field('tcpFastOpen', {
    when: (_, node) => !['hysteria', 'hysteria2', 'tuic', 'wireguard'].includes(node.protocol),
  }),
  'dialer-proxy': text('underlyingProxy'),
};
const certificate: NodeSchema = {
  'skip-cert-verify': 'allowInsecure',
  fingerprint: text('certificatePin'),
};
const tls: NodeSchema = {
  ...certificate,
  alpn: 'alpn',
  'ech-opts': object({ enable: literal(true), config: 'ech' }, (node) => !!node.ech),
};
const transport: NodeSchema = {
  network: computed((node) => {
    const type = node.transport ?? 'tcp';

    return type === 'httpupgrade' ? 'ws' : type === 'kcp' ? 'mkcp' : type;
  }),
  'ws-opts': object(
    {
      path: fallback('path', ''),
      headers: object({ Host: text('host'), Edge: text('edge') }),
      'v2ray-http-upgrade': field('transport', { when: (value) => value === 'httpupgrade', transform: () => true }),
    },
    (node) => node.transport === 'ws' || node.transport === 'httpupgrade',
  ),
  'http-opts': object(
    {
      method: literal('GET'),
      path: computed((node) => [node.path ?? '']),
      headers: object(
        {
          Host: field('host', { when: (value) => !!value, transform: (value) => [value] }),
          Edge: field('edge', { when: (value) => !!value, transform: (value) => [value] }),
        },
        (node) => !!node.host,
      ),
    },
    (node) => node.transport === 'http',
  ),
  'h2-opts': object(
    {
      path: fallback('path', ''),
      host: field('host', { when: (value) => !!value, transform: (value) => [value] }),
    },
    (node) => node.transport === 'h2',
  ),
  'xhttp-opts': object(
    { path: text('path'), host: text('host'), mode: text('mode') },
    (node) => node.protocol === 'vless' && node.transport === 'xhttp',
  ),
  'mkcp-opts': object(
    {
      seed: computed((node) => node.xraySeed ?? node.path),
      header: field('headerType', { transform: (value) => (value === 'wechatvideo' ? 'wechat-video' : value) }),
    },
    (node) => node.protocol === 'vmess' && node.transport === 'kcp',
  ),
  'grpc-opts': object(
    {
      'grpc-service-name': computed((node) => node.serviceName ?? node.path ?? ''),
    },
    (node) => node.transport === 'grpc',
  ),
};
const reality: NodeSchema = {
  'reality-opts': object(
    { 'public-key': 'realityPublicKey', 'short-id': text('realityShortId') },
    (node) => !!node.realityPublicKey,
  ),
};
const fingerprint: NodeSchema = { 'client-fingerprint': text('fingerprint') };
const xray: NodeSchema = {
  ...base,
  uuid: fallback('uuid', ''),
  tls: computed((node) => (node.realityPublicKey ? true : (node.tls ?? false))),
  ...tls,
  ...fingerprint,
  ...reality,
  ...transport,
  servername: text('serverName'),
  'packet-encoding': field('packetEncoding', { when: (value) => value === 'packetaddr' || value === 'xudp' }),
};
const quic: NodeSchema = {
  ...base,
  'skip-cert-verify': 'allowInsecure',
  alpn: 'alpn',
  fingerprint: text('certificatePin'),
  sni: text('serverName'),
};

function definition(fields: NodeSchema, when?: NodeDefinition['when']): NodeDefinition {
  return {
    schema: { ...base, ...fields },
    when: (node) =>
      (!['socks5', 'http', 'https'].includes(node.protocol) || !node.realityPublicKey) && (!when || when(node)),
  };
}

function supportedTransport(node: Readonly<NodeSource>): boolean {
  return (
    ['tcp', 'ws', 'http', 'h2', 'grpc'].includes(node.transport ?? 'tcp') ||
    node.transport === 'httpupgrade' ||
    (node.protocol === 'vmess' && node.transport === 'kcp') ||
    (node.protocol === 'vless' && node.transport === 'xhttp' && !node.xrayExtra)
  );
}

export const schema: NodeModule['nodes'] = {
  ss: definition(
    {
      cipher: fallback('encryption', ''),
      password: fallback('password', ''),
      plugin: computed((node) =>
        ['simple-obfs', 'obfs-local'].includes(node.plugin ?? '')
          ? 'obfs'
          : node.plugin === 'v2ray-plugin'
            ? node.plugin
            : undefined,
      ),
      'plugin-opts': object(
        {
          mode: computed((node) => {
            const options = pluginOptions(node);

            return node.plugin === 'v2ray-plugin' ? options.mode || 'websocket' : options.obfs;
          }),
          host: computed((node) => {
            const options = pluginOptions(node);

            return (node.plugin === 'v2ray-plugin' ? options.host : options['obfs-host']) ?? '';
          }),
          path: computed((node) => (node.plugin === 'v2ray-plugin' ? (pluginOptions(node).path ?? '') : undefined)),
          tls: computed((node) =>
            node.plugin === 'v2ray-plugin' ? Object.hasOwn(pluginOptions(node), 'tls') : undefined,
          ),
          mux: computed((node) =>
            node.plugin === 'v2ray-plugin' && pluginOptions(node).mux !== undefined
              ? !['0', 'false'].includes(pluginOptions(node).mux)
              : undefined,
          ),
          'skip-cert-verify': field('allowInsecure', { when: (_, node) => node.plugin === 'v2ray-plugin' }),
        },
        (node) => ['simple-obfs', 'obfs-local', 'v2ray-plugin'].includes(node.plugin ?? ''),
      ),
    },
    (node) => {
      if (!node.plugin) {
        return true;
      }

      const options = pluginOptions(node);

      return node.plugin === 'v2ray-plugin'
        ? !options.mode || options.mode === 'websocket'
        : ['simple-obfs', 'obfs-local'].includes(node.plugin) && ['http', 'tls'].includes(options.obfs);
    },
  ),
  snell: definition(
    {
      psk: 'password',
      version: fallback('snellVersion', 1),
      reuse: field('snellReuse', { when: (_, node) => [4, 5].includes(node.snellVersion ?? 1) }),
      udp: field('udp', { when: (_, node) => (node.snellVersion ?? 1) >= 3 }),
      ...fingerprint,
      'obfs-opts': object(
        {
          mode: computed((node) => (node.shadowTlsPassword ? 'shadow-tls' : node.obfs)),
          host: computed((node) => node.shadowTlsSni || node.host),
          password: text('shadowTlsPassword'),
          version: 'shadowTlsVersion',
          alpn: 'alpn',
        },
        (node) => !!(node.obfs || node.shadowTlsPassword),
      ),
    },
    (node) => (node.snellVersion ?? 1) <= 5 && !node.path && !node.snellMode && node.snellUdpPort === undefined,
  ),
  ssr: definition({
    cipher: 'encryption',
    password: fallback('password', ''),
    protocol: fallback('ssrProtocol', ''),
    obfs: fallback('obfs', ''),
    'protocol-param': fallback('ssrProtocolParam', ''),
    'obfs-param': fallback('obfsParam', ''),
  }),
  vmess: {
    schema: { ...xray, alterId: fallback('alterId', 0), cipher: fallback('encryption', '') },
    when: supportedTransport,
  },
  vless: {
    schema: {
      ...xray,
      flow: text('flow'),
      encryption: field('encryption', { when: (value) => value !== 'none' && value !== '' }),
    },
    when: (node) =>
      supportedTransport(node) &&
      node.packetEncoding !== 'none' &&
      (!node.flow ||
        (node.flow === 'xtls-rprx-vision' &&
          (node.transport ?? 'tcp') === 'tcp' &&
          !!(node.tls || node.realityPublicKey))),
  },
  socks5: definition({
    username: text('username'),
    password: text('password'),
    tls: 'tls',
    ...certificate,
  }),
  http: definition({
    username: text('username'),
    password: text('password'),
    tls: fallback('tls', false),
    ...certificate,
    sni: text('serverName'),
  }),
  https: definition({
    type: literal('http'),
    username: text('username'),
    password: text('password'),
    tls: fallback('tls', true),
    ...certificate,
    sni: text('serverName'),
  }),
  trojan: definition(
    {
      password: fallback('password', ''),
      ...tls,
      ...fingerprint,
      ...reality,
      sni: computed((node) => node.serverName || node.host || undefined),
      network: computed((node) => (node.transport === 'httpupgrade' ? 'ws' : (node.transport ?? 'tcp'))),
      'ws-opts': transport['ws-opts'],
      'grpc-opts': transport['grpc-opts'],
    },
    (node) =>
      ['tcp', 'ws', 'grpc', 'httpupgrade'].includes(node.transport ?? 'tcp') && !node.encryption && !node.plugin,
  ),
  wireguard: definition({
    'private-key': fallback('privateKey', ''),
    'public-key': fallback('publicKey', ''),
    ip: computed((node) =>
      node.addresses?.map((address) => address.split('/')[0]).find((address) => ipVersion(address) === 4),
    ),
    ipv6: computed((node) =>
      node.addresses?.map((address) => address.split('/')[0]).find((address) => ipVersion(address) === 6),
    ),
    'allowed-ips': 'allowedIPs',
    'persistent-keepalive': 'keepAlive',
    'remote-dns-resolve': field('dns', { when: (_, node) => !!node.dns?.length, transform: () => true }),
    'pre-shared-key': text('preSharedKey'),
    reserved: 'reserved',
    dns: field('dns', { when: (value) => Array.isArray(value) && value.length > 0 }),
    mtu: field('mtu', { when: (value) => !!value }),
  }),
  hysteria: {
    schema: {
      ...quic,
      up: 'up',
      down: 'down',
      'auth-str': text('password'),
      protocol: text('network'),
      obfs: text('obfsPassword'),
      'fast-open': 'tcpFastOpen',
      ports: field('portRanges', {
        when: (_, node) => !!node.portRanges?.length,
        transform: (_, node) => node.portRanges?.join(','),
      }),
    },
    when: (node) => !!node.up && !!node.down && !node.transport && !node.hopInterval,
  },
  hysteria2: {
    schema: {
      ...quic,
      password: fallback('password', ''),
      'hop-interval': computed((node) => seconds(node.hopInterval)),
      'obfs-min-packet-size': field('minPacketSize', { when: (_, node) => node.obfs === 'gecko' }),
      'obfs-max-packet-size': field('maxPacketSize', { when: (_, node) => node.obfs === 'gecko' }),
      'realm-opts': object(
        {
          enable: literal(true),
          'server-url': computed((node) => realm(node)?.serverUrl),
          token: computed((node) => realm(node)?.token),
          'realm-id': computed((node) => realm(node)?.id),
          'stun-servers': computed((node) => realm(node)?.stunServers),
        },
        (node) => !!node.realmUrl,
      ),
      up: text('up'),
      down: text('down'),
      obfs: text('obfs'),
      'obfs-password': text('obfsPassword'),
      ports: field('portRanges', {
        when: (_, node) => !!node.portRanges?.length,
        transform: (_, node) => node.portRanges?.join(','),
      }),
    },
    when: (node) =>
      (!node.realmUrl || !!realm(node)?.stunServers.length) &&
      (!node.obfs || ['salamander', 'gecko'].includes(node.obfs)),
  },
  tuic: {
    schema: {
      ...quic,
      password: field('password', { when: (_, node) => !node.token }),
      uuid: field('uuid', { when: (_, node) => !node.token }),
      token: text('token'),
      'fast-open': 'tcpFastOpen',
      'disable-sni': fallback('disableSni', false),
      'reduce-rtt': fallback('reduceRtt', false),
      'request-timeout': fallback('requestTimeoutMs', 15000),
      'udp-relay-mode': text('udpRelayMode'),
      'congestion-controller': text('congestionControl'),
    },
  },
  anytls: {
    when: (node) => !node.realityPublicKey,
    schema: {
      ...quic,
      password: text('password'),
      'client-fingerprint': text('fingerprint'),
      udp: 'udp',
      'idle-session-check-interval': field('idleSessionCheckIntervalSeconds', { when: (value) => value !== 30 }),
      'idle-session-timeout': field('idleSessionTimeoutSeconds', { when: (value) => value !== 30 }),
      'min-idle-session': field('minIdleSession', { when: (value) => !!value }),
    },
  },
  mieru: definition(
    {
      port: computed((node) =>
        node.portRanges?.[0]?.includes('-') ? undefined : node.portRanges?.[0] ? Number(node.portRanges[0]) : node.port,
      ),
      username: text('username'),
      password: text('password'),
      multiplexing: text('multiplexing'),
      transport: computed((node) => node.portRangeTransports?.[0]?.toUpperCase()),
      'handshake-mode': text('handshakeMode'),
      'traffic-pattern': text('trafficPattern'),
      'port-range': field('portRanges', {
        when: (_, node) => !!node.portRanges?.[0]?.includes('-'),
        transform: (_, node) => node.portRanges?.[0],
      }),
    },
    (node) =>
      !node.mtu &&
      !node.hasUnknownParameters &&
      (node.portRanges?.length ?? 0) <= 1 &&
      new Set(node.portRangeTransports).size <= 1,
  ),
};
