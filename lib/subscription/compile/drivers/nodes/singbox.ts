import { isIP } from 'node:net';
import type { ProxyNode } from '../../../types/proxy-node';
import type { TargetObject } from '../../types';
import { mbps, nonempty, put } from '../shared';

export const singboxProtocols = [
  'ss',
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
  'wireguard',
] as const;

function transport(node: ProxyNode): TargetObject | undefined {
  switch (node.transport === 'tcp' && node.headerType === 'http' ? 'http' : (node.transport ?? 'tcp')) {
    case 'tcp':
      return {};
    case 'http':
      return { type: 'http', path: node.path || '/', ...(node.host ? { host: [node.host] } : {}) };
    case 'ws':
      return {
        type: 'ws',
        path: node.path || '/',
        headers: { ...(node.host ? { Host: node.host } : {}), ...(node.edge ? { Edge: node.edge } : {}) },
      };
    case 'grpc':
      return {
        type: 'grpc',
        ...(node.serviceName || node.path ? { service_name: node.serviceName || node.path || '' } : {}),
      };
    case 'httpupgrade':
      return { type: 'httpupgrade', host: node.host ?? '', path: node.path || '/' };
    default:
      return;
  }
}

function tls(node: ProxyNode): TargetObject {
  const result: TargetObject = { enabled: true };

  nonempty(result, 'server_name', node.serverName);
  put(result, 'alpn', node.alpn);
  result.insecure = node.allowInsecure ?? false;
  if (node.fingerprint) {
    result.utls = { enabled: true, fingerprint: node.fingerprint };
  }

  if (node.realityPublicKey || node.realityShortId) {
    result.reality = {
      enabled: true,
      ...(node.realityPublicKey ? { public_key: node.realityPublicKey } : {}),
      short_id: node.realityShortId ?? '',
    };
  }

  return result;
}

function bandwidth(value: string | undefined): { mbps: number } | { text: string } | undefined {
  if (!value) {
    return;
  }

  const rate = mbps(value);

  if (rate !== undefined && rate > 0) {
    return { mbps: rate };
  }

  if (/^[1-9]\d*\s*(?:[KMGT]?bps|[KMGT]?Bps)$/i.test(value)) {
    return { text: value };
  }

  return;
}

export function singboxNode(node: ProxyNode): TargetObject | undefined {
  const output: TargetObject = { type: node.protocol, tag: node.name, server: node.server, server_port: node.port };

  switch (node.protocol) {
    case 'ss':
      output.type = 'shadowsocks';
      output.method = node.encryption ?? '';
      output.password = node.password ?? '';
      if (node.plugin && node.pluginOptions?.length) {
        if (!['simple-obfs', 'obfs-local', 'v2ray-plugin'].includes(node.plugin)) {
          return;
        }

        output.plugin = node.plugin === 'simple-obfs' ? 'obfs-local' : node.plugin;
        output.plugin_opts = node.pluginOptions.join(';');
      }

      break;
    case 'vmess':
    case 'vless':
    case 'trojan': {
      const value = transport(node);

      if (!value || (node.packetEncoding && !['none', 'xudp'].includes(node.packetEncoding))) {
        return;
      }

      if (Object.keys(value).length) {
        output.transport = value;
      }

      if (node.protocol === 'trojan') {
        output.password = node.password ?? '';
      } else {
        output.uuid = node.uuid ?? '';
        if (node.protocol === 'vmess') {
          output.alter_id = node.alterId ?? 0;
          output.security = node.encryption ?? '';
        } else {
          nonempty(output, 'flow', node.flow);
        }

        if (
          node.packetEncoding === 'xudp' ||
          (!node.packetEncoding && node.protocol === 'vless' && node.udp && node.xudp)
        ) {
          output.packet_encoding = 'xudp';
        }
      }

      break;
    }
    case 'http':
    case 'https':
      output.type = 'http';
      output.username = node.username ?? '';
      output.password = node.password ?? '';
      break;
    case 'socks5':
      Object.assign(output, {
        type: 'socks',
        version: '5',
        username: node.username ?? '',
        password: node.password ?? '',
      });
      break;
    case 'wireguard': {
      delete output.server;
      delete output.server_port;
      const peer: TargetObject = { server: node.server, server_port: node.port, public_key: node.publicKey ?? '' };

      if (node.allowedIPs?.length) {
        peer.allowed_ips = node.allowedIPs;
      }

      nonempty(peer, 'pre_shared_key', node.preSharedKey);
      put(peer, 'reserved', node.reserved);
      output.local_address = (node.addresses ?? []).map((address) =>
        address.includes('/') ? address : `${address}/${isIP(address) === 6 ? 128 : 32}`,
      );
      output.private_key = node.privateKey ?? '';
      output.peers = [peer];
      put(output, 'system_interface', node.system);
      nonempty(output, 'interface_name', node.interfaceName);
      if (node.workers) {
        output.workers = node.workers;
      }

      if (node.mtu) {
        output.mtu = node.mtu;
      }

      break;
    }
    case 'hysteria': {
      const up = bandwidth(node.up);
      const down = bandwidth(node.down);

      if (
        !up ||
        !down ||
        (node.network && node.network !== 'udp') ||
        (node.transport && node.transport !== 'tcp') ||
        (node.hopInterval && !/^([1-9][0-9]*(?:ns|us|ms|s|m|h))+$/.test(node.hopInterval))
      ) {
        return;
      }

      output['mbps' in up ? 'up_mbps' : 'up'] = 'mbps' in up ? up.mbps : up.text;
      output['mbps' in down ? 'down_mbps' : 'down'] = 'mbps' in down ? down.mbps : down.text;
      nonempty(output, 'auth_str', node.password);
      nonempty(output, 'obfs', node.obfsPassword);
      nonempty(output, 'hop_interval', node.hopInterval);
      nonempty(output, 'network', node.transport);
      output.tls = tls(node);
      break;
    }
    case 'hysteria2':
      if (node.realmUrl || node.minPacketSize || node.maxPacketSize) {
        return;
      }

      output.password = node.password ?? '';
      if (mbps(node.up) !== undefined) {
        output.up_mbps = mbps(node.up)!;
      }

      if (mbps(node.down) !== undefined) {
        output.down_mbps = mbps(node.down)!;
      }

      if (node.obfs) {
        output.obfs = { type: node.obfs, ...(node.obfsPassword ? { password: node.obfsPassword } : {}) };
      }

      output.tls = tls(node);
      if (!node.tls) {
        nonempty(output.tls as TargetObject, 'certificate', node.publicKey);
      }

      break;
    case 'tuic':
      if (!node.uuid || !node.password) {
        return;
      }

      output.uuid = node.uuid;
      output.password = node.password;
      output.tls = tls(node);
      if (!node.tls) {
        put(output.tls as TargetObject, 'disable_sni', node.disableSni);
      }

      nonempty(output, 'congestion_control', node.congestionControl);
      nonempty(output, 'udp_relay_mode', node.udpRelayMode);
      put(output, 'zero_rtt_handshake', node.reduceRtt);
      break;
    case 'anytls':
      output.password = node.password ?? '';
      output.tls = tls(node);
      if (node.idleSessionCheckIntervalSeconds !== undefined && node.idleSessionCheckIntervalSeconds !== 30) {
        output.idle_session_check_interval = `${node.idleSessionCheckIntervalSeconds}s`;
      }

      if (node.idleSessionTimeoutSeconds !== undefined && node.idleSessionTimeoutSeconds !== 30) {
        output.idle_session_timeout = `${node.idleSessionTimeoutSeconds}s`;
      }

      if (node.minIdleSession) {
        output.min_idle_session = node.minIdleSession;
      }

      break;
    default:
      return;
  }
  if (node.portRanges?.length && (node.protocol === 'hysteria' || node.protocol === 'hysteria2')) {
    if (node.protocol === 'hysteria2' && node.portRanges.length === 1 && /^\d+$/.test(node.portRanges[0])) {
      output.server_port = Number(node.portRanges[0]);
    } else {
      delete output.server_port;
      output.server_ports = node.portRanges.map((range) => range.replace('-', ':'));
    }
  }

  if (node.tls && node.protocol !== 'hysteria') {
    output.tls = tls(node);
  }

  if (node.udp === false && node.protocol !== 'anytls' && !(node.protocol === 'hysteria' && node.transport)) {
    output.network = 'tcp';
  }

  if (node.protocol !== 'anytls') {
    put(output, 'tcp_fast_open', node.tcpFastOpen);
  }

  return output;
}
