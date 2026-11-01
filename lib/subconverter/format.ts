import type { ProxyNode } from '@/lib/types/subscriptions/nodes';
import { proxyTypes } from './proxy-types';
import type { ClashProxy } from './types/clash';
import type { SingBoxOutbound } from './types/sing-box';

export function formatClash(node: ProxyNode): ClashProxy {
  const type = Object.entries(proxyTypes).find(([, value]) => value === node.type)?.[0];

  if (!type) {
    throw new Error('Unsupported Clash protocol');
  }

  const result: ClashProxy = {
    name: node.remark,
    type: type === 'https' ? 'http' : type,
    server: node.hostname,
    port: node.port,
  };

  if (node.udp !== null) {
    result.udp = node.udp;
  }

  if (node.tcpFastOpen !== null) {
    result.tfo = node.tcpFastOpen;
  }

  if (node.allowInsecure !== null) {
    result['skip-cert-verify'] = node.allowInsecure;
  }

  switch (node.type) {
    case 'Shadowsocks':
    case 'ShadowsocksR':
      result.cipher = node.encryptMethod;
      result.password = node.password;
      if (node.plugin) {
        result.plugin = node.plugin;
        result['plugin-opts'] = Object.fromEntries(
          node.pluginOption
            .split(';')
            .filter(Boolean)
            .map((part) => {
              const [key, ...value] = part.split('=');

              return [key, value.join('=') || true];
            }),
        );
      }

      if (node.type === 'ShadowsocksR') {
        result.protocol = node.protocol;
        result['protocol-param'] = node.protocolParam;
        result.obfs = node.obfs;
        result['obfs-param'] = node.obfsParam;
      }

      break;
    case 'VMess':
    case 'VLESS':
      result.uuid = node.userId;
      if (node.type === 'VMess') {
        result.alterId = node.alterId;
        result.cipher = node.encryptMethod || 'auto';
      } else {
        if (node.flow) {
          result.flow = node.flow;
        }

        if (node.publicKey) {
          result['reality-opts'] = { 'public-key': node.publicKey, 'short-id': node.shortId };
        }
      }

      break;
    case 'HTTP':
    case 'HTTPS':
    case 'SOCKS5':
    case 'Naive':
    case 'Mieru':
      result.username = node.username;
      result.password = node.password;
      break;
    case 'Snell':
      result.psk = node.password;
      result.version = node.snellVersion;
      break;
    case 'WireGuard':
      result['private-key'] = node.privateKey;
      result['public-key'] = node.publicKey;
      result['pre-shared-key'] = node.preSharedKey;
      result.ip = node.selfIP;
      result.ipv6 = node.selfIPv6;
      result.mtu = node.mtu;
      result.dns = node.dnsServers;
      if (node.wireGuardPeers.length) {
        result.peers = node.wireGuardPeers.map((peer) => ({
          server: peer.hostname,
          port: peer.port,
          'public-key': peer.publicKey,
          'pre-shared-key': peer.preSharedKey,
          'allowed-ips': peer.allowedIPs.split(',').map((value) => value.trim()),
        }));
      }

      break;
    case 'Hysteria':
      result['auth-str'] = node.authStr;
      result.up = node.upMbps;
      result.down = node.downMbps;
      result.protocol = node.protocol || 'udp';
      result.obfs = node.obfs;
      break;
    case 'Hysteria2':
      result.password = node.password;
      if (node.ports) {
        result.ports = node.ports;
      }

      if (node.obfs) {
        result.obfs = node.obfs;
        result['obfs-password'] = node.obfsPassword;
      }

      break;
    case 'TUIC':
      result.uuid = node.userId;
      result.password = node.password;
      if (node.token) {
        result.token = node.token;
      }

      result['congestion-controller'] = node.congestionControl;
      result['udp-relay-mode'] = node.udpRelayMode;
      break;
    case 'AnyTLS':
      result.password = node.password;
      result['idle-session-check-interval'] = node.idleSessionCheckInterval;
      result['idle-session-timeout'] = node.idleSessionTimeout;
      result['min-idle-session'] = node.minIdleSession;
      break;
    case 'Trojan':
      result.password = node.password;
      break;
  }
  if (node.tlsSecure || node.type === 'HTTPS') {
    result.tls = true;
  }

  if (node.serverName) {
    result.servername = node.serverName;
  }

  if (node.fingerprint) {
    result['client-fingerprint'] = node.fingerprint;
  }

  if (node.alpnList.length) {
    result.alpn = node.alpnList;
  }

  if (node.transferProtocol) {
    result.network = node.transferProtocol;
  }

  if (node.transferProtocol === 'ws') {
    result['ws-opts'] = { path: node.path, headers: node.host ? { Host: node.host } : {} };
  }

  if (node.transferProtocol === 'grpc') {
    result['grpc-opts'] = { 'grpc-service-name': node.grpcServiceName };
  }

  if (node.transferProtocol === 'http') {
    result['http-opts'] = { path: [node.path], headers: node.host ? { Host: [node.host] } : {} };
  }

  return result;
}

export function formatSingBox(node: ProxyNode): SingBoxOutbound {
  const clash = formatClash(node);
  const names: Partial<Record<ProxyNode['type'], string>> = {
    Shadowsocks: 'shadowsocks',
    VMess: 'vmess',
    VLESS: 'vless',
    Trojan: 'trojan',
    HTTP: 'http',
    HTTPS: 'http',
    SOCKS5: 'socks',
    Hysteria: 'hysteria',
    Hysteria2: 'hysteria2',
    TUIC: 'tuic',
    AnyTLS: 'anytls',
    Snell: 'snell',
    Naive: 'naive',
  };
  const type = names[node.type];

  if (!type) {
    throw new Error(`Protocol ${node.type} is not supported by this sing-box adapter`);
  }

  const result: SingBoxOutbound = { type, tag: node.remark, server: node.hostname, server_port: node.port };

  if (clash.password !== undefined) {
    result.password = clash.password;
  }

  if (clash.username !== undefined) {
    result.username = clash.username;
  }

  if (clash.uuid !== undefined) {
    result.uuid = clash.uuid;
  }

  if (node.type === 'Shadowsocks') {
    result.method = node.encryptMethod;
  }

  if (node.type === 'VMess') {
    result.security = node.encryptMethod || 'auto';
    result.alter_id = node.alterId;
  }

  if (node.flow) {
    result.flow = node.flow;
  }

  if (node.type === 'Snell') {
    result.password = node.password;
    result.version = node.snellVersion;
  }

  if (node.type === 'Hysteria') {
    result.auth_str = node.authStr;
    result.up_mbps = Number(node.upMbps);
    result.down_mbps = Number(node.downMbps);
  }

  if (node.type === 'Hysteria2' && node.obfs) {
    result.obfs = { type: node.obfs, password: node.obfsPassword };
  }

  if (node.type === 'TUIC') {
    result.congestion_control = node.congestionControl;
    result.udp_relay_mode = node.udpRelayMode;
  }

  if (node.tlsSecure || ['Trojan', 'HTTPS', 'Hysteria', 'Hysteria2', 'TUIC', 'AnyTLS'].includes(node.type)) {
    result.tls = {
      enabled: true,
      server_name: node.serverName,
      insecure: node.allowInsecure ?? false,
      alpn: node.alpnList,
    };
  }

  if (node.publicKey && result.tls) {
    result.tls.reality = { enabled: true, public_key: node.publicKey, short_id: node.shortId };
  }

  if (node.transferProtocol && node.transferProtocol !== 'tcp') {
    if (!['ws', 'grpc', 'http', 'quic', 'httpupgrade'].includes(node.transferProtocol)) {
      throw new Error('Unsupported sing-box transport');
    }

    result.transport = {
      type: node.transferProtocol as 'ws' | 'grpc' | 'http' | 'quic' | 'httpupgrade',
      path: node.path,
      host: node.host ? [node.host] : [],
      service_name: node.grpcServiceName,
    };
  }

  return result;
}
