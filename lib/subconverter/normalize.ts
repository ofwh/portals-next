import { appError } from '@/lib/api';
import type { ParsedProxyNode } from '@/lib/types/subscriptions/nodes';
import { parameterDefaults } from './defaults';
import { proxyTypes } from './proxy-types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function normalizeProxy(raw: unknown, index: number): ParsedProxyNode {
  if (!isRecord(raw) || typeof raw.type !== 'string' || !proxyTypes[raw.type]) {
    throw appError('workflow.SUBSCRIPTION_PARSE_FAILED');
  }

  const node: ParsedProxyNode = { ...structuredClone(parameterDefaults), type: proxyTypes[raw.type], id: index };
  const strings: Record<string, keyof typeof parameterDefaults> = {
    name: 'remark',
    server: 'hostname',
    password: 'password',
    username: 'username',
    cipher: 'encryptMethod',
    uuid: 'userId',
    network: 'transferProtocol',
    sni: 'serverName',
    servername: 'serverName',
    flow: 'flow',
    fingerprint: 'fingerprint',
    'client-fingerprint': 'fingerprint',
    'private-key': 'privateKey',
    'public-key': 'publicKey',
    'pre-shared-key': 'preSharedKey',
    ip: 'selfIP',
    ipv6: 'selfIPv6',
    protocol: 'protocol',
    'protocol-param': 'protocolParam',
    obfs: 'obfs',
    'obfs-param': 'obfsParam',
    'obfs-password': 'obfsPassword',
    ports: 'ports',
    'auth-str': 'authStr',
    token: 'token',
    path: 'path',
    host: 'host',
    'short-id': 'shortId',
    psk: 'password',
  };

  for (const [key, target] of Object.entries(strings)) {
    if (raw[key] !== undefined) {
      if (typeof raw[key] !== 'string') {
        throw appError('workflow.SUBSCRIPTION_PARSE_FAILED');
      }

      Object.assign(node, { [target]: raw[key] });
    }
  }
  node.port = Number(raw.port);
  for (const [key, target] of Object.entries({
    udp: 'udp',
    tfo: 'tcpFastOpen',
    'skip-cert-verify': 'allowInsecure',
    tls: 'tlsSecure',
  })) {
    if (raw[key] !== undefined) {
      if (typeof raw[key] !== 'boolean') {
        throw appError('workflow.SUBSCRIPTION_PARSE_FAILED');
      }

      Object.assign(node, { [target]: raw[key] });
    }
  }
  if (raw.alterId !== undefined) {
    node.alterId = Number(raw.alterId);
  }

  if (Array.isArray(raw.alpn) && raw.alpn.every((v) => typeof v === 'string')) {
    node.alpnList = raw.alpn;
  }

  if (isRecord(raw['ws-opts'])) {
    const ws = raw['ws-opts'];

    if (typeof ws.path === 'string') {
      node.path = ws.path;
    }

    if (isRecord(ws.headers) && typeof ws.headers.Host === 'string') {
      node.host = ws.headers.Host;
    }
  }

  if (isRecord(raw['grpc-opts']) && typeof raw['grpc-opts']['grpc-service-name'] === 'string') {
    node.grpcServiceName = raw['grpc-opts']['grpc-service-name'];
  }

  if (isRecord(raw['reality-opts'])) {
    const reality = raw['reality-opts'];

    if (typeof reality['public-key'] === 'string') {
      node.publicKey = reality['public-key'];
    }

    if (typeof reality['short-id'] === 'string') {
      node.shortId = reality['short-id'];
    }
  }

  for (const [key, target] of Object.entries({
    version: 'snellVersion',
    mtu: 'mtu',
    'idle-session-check-interval': 'idleSessionCheckInterval',
    'idle-session-timeout': 'idleSessionTimeout',
    'min-idle-session': 'minIdleSession',
  })) {
    if (raw[key] !== undefined) {
      if (typeof raw[key] !== 'number' || !Number.isFinite(raw[key])) {
        throw new Error('Invalid numeric proxy field');
      }

      Object.assign(node, { [target]: raw[key] });
    }
  }
  if (raw.up !== undefined) {
    node.upMbps = String(raw.up);
  }

  if (raw.down !== undefined) {
    node.downMbps = String(raw.down);
  }

  if (typeof raw['congestion-controller'] === 'string') {
    node.congestionControl = raw['congestion-controller'];
  }

  if (typeof raw['udp-relay-mode'] === 'string') {
    node.udpRelayMode = raw['udp-relay-mode'];
  }

  if (Array.isArray(raw.dns) && raw.dns.every((item) => typeof item === 'string')) {
    node.dnsServers = raw.dns;
  }

  if (typeof raw.plugin === 'string') {
    node.plugin = raw.plugin;
  }

  if (isRecord(raw['plugin-opts'])) {
    node.pluginOption = Object.entries(raw['plugin-opts'])
      .map(([key, value]) => `${key}=${String(value)}`)
      .join(';');
  }

  if (Array.isArray(raw.peers)) {
    node.wireGuardPeers = raw.peers.map((peer) => {
      if (
        !isRecord(peer) ||
        typeof peer.server !== 'string' ||
        typeof peer.port !== 'number' ||
        typeof peer['public-key'] !== 'string'
      ) {
        throw new Error('Invalid WireGuard peer');
      }

      return {
        hostname: peer.server,
        port: peer.port,
        publicKey: peer['public-key'],
        preSharedKey: typeof peer['pre-shared-key'] === 'string' ? peer['pre-shared-key'] : '',
        allowedIPs: Array.isArray(peer['allowed-ips']) ? peer['allowed-ips'].join(', ') : '0.0.0.0/0, ::/0',
        reserved: Array.isArray(peer.reserved) ? peer.reserved.join(',') : '',
        keepAlive: 0,
      };
    });
  }

  node.canonicalProxyJson = JSON.stringify(raw);
  if (!node.remark || !node.hostname) {
    throw appError('workflow.SUBSCRIPTION_PARSE_FAILED');
  }

  return node;
}

export function normalizeSingBox(raw: unknown, index: number): ParsedProxyNode {
  if (!isRecord(raw) || typeof raw.type !== 'string') {
    throw new Error('Invalid sing-box outbound');
  }

  const types: Record<string, string> = { shadowsocks: 'ss', socks: 'socks5' };
  const value: Record<string, unknown> = {
    ...raw,
    type: types[raw.type] ?? raw.type,
    name: raw.tag ?? raw.server,
    port: raw.server_port,
    cipher: raw.method ?? raw.security,
    alterId: raw.alter_id,
    'auth-str': raw.auth_str,
  };

  for (const [target, source] of Object.entries({
    'private-key': 'private_key',
    'public-key': 'peer_public_key',
    'pre-shared-key': 'pre_shared_key',
  })) {
    if (raw[source] !== undefined) {
      value[target] = raw[source];
    }
  }
  if (isRecord(raw.tls)) {
    value.tls = raw.tls.enabled;
    value.servername = raw.tls.server_name;
    value['skip-cert-verify'] = raw.tls.insecure;
    value.alpn = raw.tls.alpn;
    if (isRecord(raw.tls.reality)) {
      value['reality-opts'] = { 'public-key': raw.tls.reality.public_key, 'short-id': raw.tls.reality.short_id };
    }
  }

  if (isRecord(raw.obfs)) {
    value.obfs = raw.obfs.type;
    value['obfs-password'] = raw.obfs.password;
  }

  if (isRecord(raw.transport)) {
    value.network = raw.transport.type;
    value.path = raw.transport.path;
    if (raw.transport.type === 'ws') {
      value['ws-opts'] = { path: raw.transport.path, headers: raw.transport.headers };
    }

    if (raw.transport.type === 'grpc') {
      value['grpc-opts'] = { 'grpc-service-name': raw.transport.service_name };
    }
  }

  const node = normalizeProxy(value, index);

  if (raw.up_mbps !== undefined) {
    node.upMbps = String(raw.up_mbps);
  }

  if (raw.down_mbps !== undefined) {
    node.downMbps = String(raw.down_mbps);
  }

  if (typeof raw.congestion_control === 'string') {
    node.congestionControl = raw.congestion_control;
  }

  if (typeof raw.udp_relay_mode === 'string') {
    node.udpRelayMode = raw.udp_relay_mode;
  }

  return node;
}
