import type { PortRange, ProviderNode } from './types';
import { proxyNodeType } from '../schemas/proxy-node';
import type { ProxyNode } from '../types/proxy-node';

function portRange({ start, end }: PortRange): string {
  return start === end ? String(start) : `${start}-${end}`;
}

export function transform(node: ProviderNode): ProxyNode {
  const { transport, tls } = node;
  const result: ProxyNode = {
    protocol: node.protocol,
    name: node.name,
    server: node.server,
    port: node.port,
    sourceId: node.sourceId,
    sourceGroup: node.sourceGroup,
    sourceGroupId: node.sourceGroupId,
    transport: transport?.kind,
    host: transport?.host,
    path: transport?.path,
    edge: transport?.edge,
    headerType: transport?.headerType,
    serviceName: transport?.serviceName,
    mode: transport?.mode,
    quicSecurity: transport?.quicSecurity,
    quicKey: transport?.quicKey,
    tls: tls?.enabled,
    serverName: tls?.serverName,
    allowInsecure: tls?.allowInsecure,
    disableSni: tls?.disableSni,
    tls13: tls?.tls13,
    alpn: tls?.alpn,
    fingerprint: tls?.fingerprint,
    realityPublicKey: tls?.reality?.publicKey,
    realityShortId: tls?.reality?.shortId,
    ech: tls?.ech,
    udp: node.udp,
    xudp: node.xudp,
    tcpFastOpen: node.tcpFastOpen,
    underlyingProxy: node.underlyingProxy,
    testUrl: node.testUrl,
  };

  if ('username' in node) {
    result.username = node.username;
  }

  if ('password' in node) {
    result.password = node.password;
  }

  if ('uuid' in node) {
    result.uuid = node.uuid;
  }

  if ('token' in node) {
    result.token = node.token;
  }

  if ('encryption' in node) {
    result.encryption = node.encryption;
    result.packetEncoding = node.packetEncoding;
  }

  if ('xray' in node) {
    result.xrayAuthority = node.xray?.authority;
    result.xrayExtra = node.xray?.extra;
    result.xrayFm = node.xray?.fm;
    result.xrayPcs = node.xray?.pcs;
    result.xrayVcn = node.xray?.vcn;
    result.xraySeed = node.xray?.seed;
    result.xraySpx = node.xray?.spx;
  }

  if (node.protocol === 'ss' || node.protocol === 'ssr') {
    result.encryption = node.method;
  }

  const plugin = node.protocol === 'ss' ? node.plugin : node.protocol === 'trojan' ? node.trojanGo?.plugin : undefined;

  if (plugin) {
    result.plugin = plugin.name;
    result.pluginOptions = Object.entries(plugin.options).map(([key, value]) =>
      value === true ? key : `${key}=${value}`,
    );
  }

  switch (node.protocol) {
    case 'ssr':
      result.ssrProtocol = node.ssr.protocol;
      result.ssrProtocolParam = node.ssr.protocolParam;
      result.obfs = node.ssr.obfs;
      result.obfsParam = node.ssr.obfsParam;
      break;
    case 'vmess':
      result.alterId = node.alterId;
      break;
    case 'vless':
      result.flow = node.flow;
      break;
    case 'trojan':
      result.encryption = node.trojanGo?.encryption;
      break;
    case 'hysteria':
      result.password = node.hysteria.auth;
      result.network = node.hysteria.network;
      result.obfs = node.hysteria.obfs;
      result.obfsPassword = node.hysteria.obfsPassword;
      break;
    case 'hysteria2':
      result.certificatePin = node.hysteria2.certificatePin;
      result.realmUrl = node.hysteria2.realm?.url;
      result.realmToken = node.hysteria2.realm?.token;
      result.obfs = node.hysteria2.obfs;
      result.obfsPassword = node.hysteria2.obfsPassword;
      result.minPacketSize = node.hysteria2.gecko?.minPacketSize;
      result.maxPacketSize = node.hysteria2.gecko?.maxPacketSize;
      break;
    case 'tuic':
      Object.assign(result, node.tuic);
      break;
    case 'anytls':
      Object.assign(result, node.anytls);
      break;
    case 'naive':
      Object.assign(result, node.naive);
      break;
    case 'wireguard': {
      const { peers, ...wireguard } = node.wireguard;
      const { endpoint, ...peer } = peers[0];

      Object.assign(result, wireguard, peer, endpoint);
      break;
    }
    case 'mieru': {
      const { bindings, ...mieru } = node.mieru;

      Object.assign(result, mieru);
      result.portRanges = bindings.map(portRange);
      result.portRangeTransports = bindings.map(({ transport }) => (transport === 'TCP' ? 'tcp' : 'udp'));
      break;
    }
  }
  if (node.protocol === 'hysteria' || node.protocol === 'hysteria2') {
    const options = node.protocol === 'hysteria' ? node.hysteria : node.hysteria2;

    result.portRanges = options.ports.map(portRange);
    result.up = options.up;
    result.down = options.down;
    result.hopInterval = options.hopInterval;
  }

  for (const [key, value] of Object.entries(result)) {
    if (value === undefined) {
      Reflect.deleteProperty(result, key);
    }
  }

  return proxyNodeType.parse(result);
}
