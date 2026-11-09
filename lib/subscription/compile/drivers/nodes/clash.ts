import { isIP } from 'node:net';
import type { ProxyNode } from '../../../types/proxy-node';
import type { TargetObject } from '../../types';
import { nonempty, pluginOptions, put } from '../shared';

export const clashProtocols = [
  'ss',
  'ssr',
  'vmess',
  'vless',
  'trojan',
  'socks5',
  'http',
  'https',
  'wireguard',
  'hysteria',
  'hysteria2',
  'tuic',
  'anytls',
  'mieru',
] as const;

function transport(node: ProxyNode, output: TargetObject): boolean {
  const type = node.transport ?? 'tcp';
  const headers: TargetObject = {};

  nonempty(headers, 'Host', node.host);
  nonempty(headers, 'Edge', node.edge);
  if (type === 'tcp') {
    if (node.protocol === 'vless') {
      output.network = 'tcp';
    }
  } else if (type === 'ws' || (type === 'httpupgrade' && node.protocol === 'vless')) {
    output.network = 'ws';
    const options: TargetObject = { path: node.path ?? '' };

    if (Object.keys(headers).length) {
      options.headers = headers;
    }

    if (type === 'httpupgrade') {
      options['v2ray-http-upgrade'] = true;
    }

    output['ws-opts'] = options;
  } else if (type === 'http') {
    output.network = type;
    output['http-opts'] = {
      method: 'GET',
      path: [node.path ?? ''],
      ...(node.host ? { headers: { Host: [node.host], ...(node.edge ? { Edge: [node.edge] } : {}) } } : {}),
    };
  } else if (type === 'h2') {
    output.network = type;
    output['h2-opts'] = { path: node.path ?? '', ...(node.host ? { host: [node.host] } : {}) };
  } else if (type === 'grpc') {
    output.network = type;
    output['grpc-opts'] =
      node.protocol === 'vless'
        ? { 'grpc-mode': node.mode ?? '', 'grpc-service-name': node.serviceName ?? '' }
        : { 'grpc-service-name': node.path ?? '' };
    if (node.protocol === 'vmess') {
      output.servername = node.host ?? '';
    }
  } else {
    return false;
  }

  return true;
}

export function clashNode(node: ProxyNode): TargetObject | undefined {
  const output: TargetObject = { name: node.name, server: node.server, port: node.port };

  switch (node.protocol) {
    case 'ss': {
      Object.assign(output, { type: 'ss', cipher: node.encryption ?? '', password: node.password ?? '' });
      const options = pluginOptions(node);

      if (node.plugin === 'simple-obfs' || node.plugin === 'obfs-local') {
        output.plugin = 'obfs';
        output['plugin-opts'] = { mode: options.obfs ?? '', host: options['obfs-host'] ?? '' };
      } else if (node.plugin === 'v2ray-plugin') {
        const plugin: TargetObject = {
          mode: options.mode ?? '',
          host: options.host ?? '',
          path: options.path ?? '',
          tls: Object.hasOwn(options, 'tls'),
          mux: Object.hasOwn(options, 'mux'),
        };

        put(plugin, 'skip-cert-verify', node.allowInsecure);
        output.plugin = node.plugin;
        output['plugin-opts'] = plugin;
      }

      break;
    }
    case 'ssr':
      Object.assign(output, {
        type: 'ssr',
        cipher: node.encryption === 'none' ? 'dummy' : (node.encryption ?? ''),
        password: node.password ?? '',
        protocol: node.ssrProtocol ?? '',
        obfs: node.obfs ?? '',
        'protocol-param': node.ssrProtocolParam ?? '',
        'obfs-param': node.obfsParam ?? '',
      });
      break;
    case 'vmess':
    case 'vless': {
      Object.assign(output, { type: node.protocol, uuid: node.uuid ?? '', tls: node.tls ?? false });
      if (node.protocol === 'vmess') {
        output.alterId = node.alterId ?? 0;
        output.cipher = node.encryption ?? '';
      } else {
        nonempty(output, 'flow', node.flow);
        nonempty(output, 'packet-encoding', node.packetEncoding);
        put(output, 'tfo', node.tcpFastOpen);
        if (node.xudp && node.udp) {
          output.xudp = true;
        }

        if (node.realityPublicKey || node.realityShortId) {
          output['reality-opts'] = {
            ...(node.realityPublicKey ? { 'public-key': node.realityPublicKey } : {}),
            ...(node.realityShortId ? { 'short-id': node.realityShortId } : {}),
          };
        }

        if (node.realityPublicKey || node.flow === 'xtls-rprx-vision' || node.fingerprint) {
          output['client-fingerprint'] = node.fingerprint || 'chrome';
        }
      }

      nonempty(output, 'servername', node.serverName);
      put(output, 'skip-cert-verify', node.allowInsecure);
      if (node.alpn?.length) {
        output.alpn = node.alpn;
      }

      if (!transport(node, output)) {
        return;
      }

      break;
    }
    case 'socks5':
    case 'http':
    case 'https':
      output.type = node.protocol === 'socks5' ? 'socks5' : 'http';
      nonempty(output, 'username', node.username);
      nonempty(output, 'password', node.password);
      if (node.protocol !== 'socks5') {
        output.tls = node.tls ?? node.protocol === 'https';
      }

      put(output, 'skip-cert-verify', node.allowInsecure);
      break;
    case 'trojan':
      output.type = 'trojan';
      output.password = node.password ?? '';
      nonempty(output, 'sni', node.serverName || node.host);
      put(output, 'skip-cert-verify', node.allowInsecure);
      if (node.alpn?.length) {
        output.alpn = node.alpn;
      }

      if (node.transport === 'ws' || node.transport === 'grpc') {
        transport(node, output);
      }

      break;
    case 'wireguard': {
      Object.assign(output, {
        type: 'wireguard',
        'private-key': node.privateKey ?? '',
        'public-key': node.publicKey ?? '',
      });
      for (const address of node.addresses ?? []) {
        const bare = address.split('/')[0];

        if (isIP(bare) === 4 && output.ip === undefined) {
          output.ip = bare;
        } else if (isIP(bare) === 6 && output.ipv6 === undefined) {
          output.ipv6 = bare;
        }
      }
      nonempty(output, 'pre-shared-key', node.preSharedKey);
      put(output, 'reserved', node.reserved);
      if (node.dns?.length) {
        output.dns = node.dns;
      }

      if (node.mtu) {
        output.mtu = node.mtu;
      }

      break;
    }
    case 'hysteria':
      if (!node.up || !node.down || node.transport || node.hopInterval) {
        return;
      }

      Object.assign(output, { type: 'hysteria', up: node.up, down: node.down });
      nonempty(output, 'auth-str', node.password);
      nonempty(output, 'protocol', node.network);
      nonempty(output, 'obfs', node.obfsPassword);
      put(output, 'fast-open', node.tcpFastOpen);
      if (node.portRanges?.length) {
        output.ports = node.portRanges.join(',');
      }

      nonempty(output, 'sni', node.serverName);
      put(output, 'skip-cert-verify', node.allowInsecure);
      put(output, 'alpn', node.alpn);
      break;
    case 'hysteria2':
      if (node.realmUrl || node.minPacketSize || node.maxPacketSize) {
        return;
      }

      Object.assign(output, { type: 'hysteria2', password: node.password ?? '', auth: node.password ?? '' });
      nonempty(output, 'ca-str', node.publicKey);
      nonempty(output, 'fingerprint', node.certificatePin || node.fingerprint);
      nonempty(output, 'sni', node.serverName);
      nonempty(output, 'up', node.up);
      nonempty(output, 'down', node.down);
      put(output, 'skip-cert-verify', node.allowInsecure);
      put(output, 'alpn', node.alpn);
      nonempty(output, 'obfs', node.obfs);
      nonempty(output, 'obfs-password', node.obfsPassword);
      if (node.portRanges?.length) {
        output.ports = node.portRanges.join(',');
      }

      break;
    case 'tuic':
      output.type = 'tuic';
      nonempty(output, 'password', node.password);
      nonempty(output, 'uuid', node.uuid);
      nonempty(output, 'token', node.token);
      nonempty(output, 'sni', node.serverName);
      put(output, 'skip-cert-verify', node.allowInsecure);
      put(output, 'alpn', node.alpn);
      output['disable-sni'] = node.disableSni ?? false;
      output['reduce-rtt'] = node.reduceRtt ?? false;
      output['request-timeout'] = node.requestTimeoutMs ?? 15000;
      nonempty(output, 'udp-relay-mode', node.udpRelayMode);
      nonempty(output, 'congestion-controller', node.congestionControl);
      break;
    case 'anytls':
      output.type = 'anytls';
      nonempty(output, 'password', node.password);
      nonempty(output, 'client-fingerprint', node.fingerprint);
      nonempty(output, 'sni', node.serverName);
      put(output, 'udp', node.udp);
      put(output, 'skip-cert-verify', node.allowInsecure);
      put(output, 'alpn', node.alpn);
      if (node.idleSessionCheckIntervalSeconds !== undefined && node.idleSessionCheckIntervalSeconds !== 30) {
        output['idle-session-check-interval'] = node.idleSessionCheckIntervalSeconds;
      }

      if (node.idleSessionTimeoutSeconds !== undefined && node.idleSessionTimeoutSeconds !== 30) {
        output['idle-session-timeout'] = node.idleSessionTimeoutSeconds;
      }

      if (node.minIdleSession) {
        output['min-idle-session'] = node.minIdleSession;
      }

      break;
    case 'mieru':
      if (node.mtu) {
        return;
      }

      output.type = 'mieru';
      nonempty(output, 'password', node.password);
      nonempty(output, 'username', node.username);
      nonempty(output, 'multiplexing', node.multiplexing);
      nonempty(output, 'transport', node.transport);
      nonempty(output, 'handshake-mode', node.handshakeMode);
      nonempty(output, 'traffic-pattern', node.trafficPattern);
      if (node.portRanges?.length) {
        output['port-range'] = node.portRanges.join(',');
        delete output.port;
      }

      break;
    default:
      return;
  }
  if (node.udp && node.protocol !== 'tuic') {
    output.udp = true;
  }

  return output;
}
