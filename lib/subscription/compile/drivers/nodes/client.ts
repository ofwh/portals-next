import type { ProxyNode } from '../../../types/proxy-node';
import type { TargetObject } from '../../types';
import { base64, mbps, nonempty, put } from '../shared';

export const clientProtocols = [
  'vmess',
  'ss',
  'socks5',
  'vless',
  'trojan',
  'hysteria2',
  'tuic',
  'wireguard',
  'http',
  'anytls',
  'naive',
] as const;
const ssMethods = {
  v2rayn: [
    'aes-256-gcm',
    'aes-192-gcm',
    'aes-128-gcm',
    'chacha20-ietf-poly1305',
    'xchacha20-ietf-poly1305',
    'none',
    '2022-blake3-aes-128-gcm',
    '2022-blake3-aes-256-gcm',
    '2022-blake3-chacha20-poly1305',
    'aes-128-ctr',
    'aes-192-ctr',
    'aes-256-ctr',
    'aes-128-cfb',
    'aes-192-cfb',
    'aes-256-cfb',
    'rc4-md5',
    'chacha20-ietf',
    'xchacha20',
  ],
  v2rayng: [
    'aes-256-gcm',
    'aes-128-gcm',
    'chacha20-poly1305',
    'chacha20-ietf-poly1305',
    'xchacha20-poly1305',
    'xchacha20-ietf-poly1305',
    'none',
    'plain',
    '2022-blake3-aes-128-gcm',
    '2022-blake3-aes-256-gcm',
    '2022-blake3-chacha20-poly1305',
  ],
};

function security(node: ProxyNode): string | undefined {
  if (node.realityPublicKey) {
    return node.serverName && ['vless', 'trojan', 'tuic', 'anytls', 'naive'].includes(node.protocol)
      ? 'reality'
      : undefined;
  }

  if (node.realityShortId) {
    return;
  }

  return node.tls ? 'tls' : '';
}

function transport(node: ProxyNode, desktop: boolean): string | undefined {
  const type = !node.transport || node.transport === 'tcp' ? 'raw' : node.transport === 'h2' ? 'http' : node.transport;

  if (
    !['raw', 'kcp', 'ws', 'httpupgrade', 'xhttp', 'grpc', ...(desktop ? [] : ['http'])].includes(type) ||
    node.edge ||
    node.quicSecurity ||
    node.quicKey
  ) {
    return;
  }

  if (type === 'raw' && node.headerType && !['none', 'http'].includes(node.headerType)) {
    return;
  }

  if (
    type === 'kcp' &&
    node.headerType &&
    !['none', 'srtp', 'utp', 'wechat-video', 'dtls', 'wireguard', 'dns'].includes(node.headerType)
  ) {
    return;
  }

  if (type === 'grpc' && node.mode && !['gun', 'multi'].includes(node.mode)) {
    return;
  }

  if (type === 'xhttp' && node.mode && !['auto', 'packet-up', 'stream-up', 'stream-one'].includes(node.mode)) {
    return;
  }

  return type;
}

function tlsFields(value: TargetObject, node: ProxyNode, tls: string): void {
  const fields = {
    StreamSecurity: tls,
    AllowInsecure: node.allowInsecure === undefined ? undefined : String(node.allowInsecure),
    Sni: node.serverName,
    Alpn: node.alpn?.join(','),
    Fingerprint: node.fingerprint,
    PublicKey: node.realityPublicKey,
    ShortId: node.realityShortId,
    SpiderX: node.xraySpx,
    CertSha: node.xrayPcs,
    EchConfigList: node.ech,
    VerifyPeerCertByName: node.xrayVcn,
    Finalmask: node.xrayFm,
  };

  for (const [key, field] of Object.entries(fields)) {
    nonempty(value, key, field);
  }
}

export function clientLink(node: ProxyNode, target: 'v2rayn' | 'v2rayng'): string | undefined {
  if (!node.server || !node.port || node.underlyingProxy) {
    return;
  }

  const desktop = target === 'v2rayn';
  const value: TargetObject = { ConfigType: 0, ConfigVersion: 4 };
  const extra: TargetObject = {};
  let password = node.password;
  let username = node.username;
  let scheme: string = node.protocol;
  let tls = security(node);
  let network: string | undefined;

  switch (node.protocol) {
    case 'vmess':
      if (
        !node.uuid ||
        (!desktop && node.alterId) ||
        !['aes-128-gcm', 'chacha20-poly1305', 'auto', 'none', 'zero'].includes(node.encryption || 'auto')
      ) {
        return;
      }

      value.ConfigType = 1;
      password = node.uuid;
      extra.AlterId = desktop ? String(node.alterId ?? 0) : (node.alterId ?? 0);
      extra.VmessSecurity = node.encryption || 'auto';
      break;
    case 'ss':
      if (
        !node.password ||
        node.plugin ||
        node.pluginOptions?.length ||
        !ssMethods[target].includes(node.encryption?.toLowerCase() ?? '')
      ) {
        return;
      }

      value.ConfigType = 3;
      scheme = 'shadowsocks';
      extra.SsMethod = node.encryption ?? '';
      if (desktop) {
        value.CoreType = 24;
      }

      break;
    case 'socks5':
      value.ConfigType = 4;
      scheme = 'socks';
      break;
    case 'vless':
      if (
        !node.uuid ||
        (node.encryption && node.encryption !== 'none') ||
        (node.packetEncoding && node.packetEncoding !== 'none') ||
        node.xudp
      ) {
        return;
      }

      value.ConfigType = 5;
      password = node.uuid;
      extra.VlessEncryption = 'none';
      nonempty(extra, 'Flow', node.flow);
      break;
    case 'trojan':
      if (!node.password || (desktop && node.flow)) {
        return;
      }

      value.ConfigType = 6;
      nonempty(extra, 'Flow', node.flow);
      break;
    case 'hysteria2': {
      const obfs = node.obfs?.toLowerCase();

      if (
        !node.password ||
        (obfs && !['salamander', 'gecko'].includes(obfs)) ||
        !!obfs !== !!node.obfsPassword ||
        (desktop && node.alpn?.length) ||
        (!desktop && (node.realmUrl || obfs === 'gecko' || node.publicKey))
      ) {
        return;
      }

      if (obfs === 'gecko') {
        const min = node.minPacketSize ?? 512;
        const max = node.maxPacketSize ?? 1200;

        if (min < 1 || max < min || max > 2048) {
          return;
        }

        extra.GeckoMinPacketSize = String(min);
        extra.GeckoMaxPacketSize = String(max);
      } else if (node.minPacketSize || node.maxPacketSize) {
        return;
      }

      value.ConfigType = 7;
      tls = 'tls';
      if (desktop && (node.realmUrl || obfs === 'gecko')) {
        value.CoreType = 24;
      }

      nonempty(extra, 'SalamanderPass', node.obfsPassword);
      nonempty(extra, 'Hy2RealmUrl', node.realmUrl);
      for (const [key, rate] of [
        ['UpMbps', node.up],
        ['DownMbps', node.down],
      ] as const) {
        if (rate) {
          if (mbps(rate) === undefined) {
            return;
          }

          extra[key] = mbps(rate)!;
        }
      }
      if (node.portRanges?.length) {
        extra.Ports = node.portRanges.join(',');
      }

      nonempty(extra, 'HopInterval', node.hopInterval);
      break;
    }
    case 'tuic':
      if (
        !desktop ||
        !node.uuid ||
        !node.password ||
        node.token ||
        (node.udpRelayMode && node.udpRelayMode !== 'native') ||
        node.reduceRtt ||
        node.disableSni ||
        node.fingerprint ||
        (node.requestTimeoutMs ?? 15000) !== 15000
      ) {
        return;
      }

      value.ConfigType = 8;
      value.CoreType = 24;
      username = node.uuid;
      nonempty(extra, 'CongestionControl', node.congestionControl);
      break;
    case 'wireguard':
      if (
        !node.privateKey ||
        !node.publicKey ||
        !node.addresses?.length ||
        (node.allowedIPs?.length && node.allowedIPs.join(', ') !== '0.0.0.0/0, ::/0') ||
        node.keepAlive ||
        node.interfaceName ||
        node.system !== undefined ||
        node.listenPort ||
        node.workers
      ) {
        return;
      }

      value.ConfigType = 9;
      password = node.privateKey;
      extra.WgPublicKey = node.publicKey;
      nonempty(extra, 'WgPresharedKey', node.preSharedKey);
      extra.WgInterfaceAddress = node.addresses.join(',');
      if (node.reserved?.length) {
        extra.WgReserved = node.reserved.join(',');
      }

      if (node.mtu) {
        extra.WgMtu = node.mtu;
      }

      if (!desktop) {
        value.PublicKey = node.publicKey;
      }

      break;
    case 'http':
      value.ConfigType = 10;
      break;
    case 'anytls':
      if (
        !desktop ||
        !node.password ||
        (node.idleSessionCheckIntervalSeconds ?? 30) !== 30 ||
        (node.idleSessionTimeoutSeconds ?? 30) !== 30 ||
        node.minIdleSession
      ) {
        return;
      }

      value.ConfigType = 11;
      value.CoreType = 24;
      break;
    case 'naive':
      if (!desktop || !node.password || node.alpn?.length || node.fingerprint || node.allowInsecure) {
        return;
      }

      value.ConfigType = 12;
      value.CoreType = 24;
      nonempty(extra, 'CongestionControl', node.congestionControl);
      if (node.insecureConcurrency) {
        extra.InsecureConcurrency = node.insecureConcurrency;
      }

      if (node.transport === 'quic') {
        extra.NaiveQuic = true;
      } else if (node.transport === 'https') {
        extra.NaiveQuic = false;
      }

      put(extra, 'Uot', node.uot);
      break;
    default:
      return;
  }
  nonempty(value, 'Remarks', node.name);
  value.Address = node.server;
  value.Port = node.port;
  nonempty(value, 'Password', password);
  nonempty(value, 'Username', username);
  if (['vmess', 'vless', 'trojan'].includes(node.protocol)) {
    network = transport(node, desktop);
    if (network === undefined || tls === undefined) {
      return;
    }

    if (
      node.flow &&
      (!['xtls-rprx-vision', 'xtls-rprx-vision-udp443'].includes(node.flow) || network !== 'raw' || !tls)
    ) {
      return;
    }

    value.Network = network;
    const transportExtra: TargetObject = {};

    if (network === 'raw') {
      transportExtra.RawHeaderType = node.headerType || 'none';
      if (node.headerType === 'http') {
        nonempty(transportExtra, 'Host', node.host);
        nonempty(transportExtra, 'Path', node.path);
      }
    } else if (network === 'kcp') {
      transportExtra.KcpHeaderType = node.headerType || 'none';
      nonempty(transportExtra, 'KcpSeed', node.path);
    } else if (network === 'grpc') {
      nonempty(transportExtra, 'GrpcAuthority', node.xrayAuthority);
      nonempty(transportExtra, 'GrpcServiceName', node.serviceName || node.path);
      nonempty(transportExtra, 'GrpcMode', node.mode);
    } else {
      nonempty(transportExtra, 'Host', node.host);
      nonempty(transportExtra, 'Path', node.path);
      if (network === 'xhttp') {
        nonempty(transportExtra, 'XhttpMode', node.mode);
        nonempty(transportExtra, 'XhttpExtra', node.xrayExtra);
      }
    }

    value.TransportExtraObj = transportExtra;
    tlsFields(value, node, tls);
  } else if (node.protocol === 'hysteria2') {
    value.StreamSecurity = 'tls';
    if (node.allowInsecure !== undefined) {
      value.AllowInsecure = String(node.allowInsecure);
    }

    nonempty(value, 'Sni', node.serverName);
    nonempty(value, 'Alpn', node.alpn?.join(','));
    nonempty(value, 'CertSha', node.certificatePin || node.fingerprint);
    nonempty(value, 'EchConfigList', node.ech);
    if (desktop) {
      nonempty(value, 'Cert', node.publicKey);
    }
  } else if (['tuic', 'anytls', 'naive'].includes(node.protocol)) {
    if (tls === undefined) {
      return;
    }

    tlsFields(value, node, tls);
  }

  value.ProtoExtraObj = extra;

  return `v2rayn://${scheme}/${base64(JSON.stringify(value), true)}`;
}
