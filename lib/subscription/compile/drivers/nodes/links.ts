import type { ProxyNode } from '../../../types/proxy-node';
import type { TargetObject } from '../../types';
import { base64, host, nonempty } from '../shared';

export const mixedProtocols = ['ss', 'ssr', 'vmess', 'vless', 'trojan', 'hysteria2'] as const;

export function query(values: Record<string, string | number | boolean | undefined>): string {
  const items = Object.entries(values)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);

  return items.length ? `?${items.join('&')}` : '';
}

function xrayQuery(node: ProxyNode): string {
  const vless = node.protocol === 'vless';
  const params: Record<string, string | number | undefined> = vless
    ? {
        encryption: node.encryption || 'none',
        security: node.realityPublicKey ? 'reality' : node.tls ? 'tls' : undefined,
        flow: node.flow,
        pbk: node.realityPublicKey,
        sid: node.realityShortId,
        fp: node.fingerprint,
        'packet-encoding': node.packetEncoding,
        insecure: node.allowInsecure ? '1' : undefined,
        alpn: node.alpn?.join(','),
        sni: node.serverName,
        type: node.transport ?? 'tcp',
      }
    : {
        security: node.realityPublicKey ? 'reality' : 'tls',
        allowInsecure: node.allowInsecure ? '1' : '0',
        insecure: node.allowInsecure ? '1' : undefined,
        sni: node.serverName || node.host,
        fp: node.fingerprint,
        pbk: node.realityPublicKey,
        sid: node.realityShortId,
        alpn: node.alpn?.join(','),
        type: node.transport ?? 'tcp',
      };

  switch (node.transport ?? 'tcp') {
    case 'tcp':
      params.headerType = node.headerType;
      if (node.headerType === 'http') {
        params.host = node.host;
        params.path = node.path || '/';
      }

      break;
    case 'kcp':
      params.headerType = node.headerType;
      params.seed = node.path;
      break;
    case 'ws':
    case 'http':
    case 'httpupgrade':
      if (vless) {
        params.headerType = node.headerType;
      }

      params.host = node.host;
      params.path = node.path || '/';
      break;
    case 'grpc':
      params.serviceName = vless ? node.serviceName : node.path;
      params.mode = node.mode;
      params.authority = node.xrayAuthority;
      break;
    case 'xhttp':
      params.host = node.host;
      params.path = node.path || '/';
      params.mode = node.mode;
      params.extra = node.xrayExtra;
      break;
    case 'quic':
      params.headerType = node.headerType;
      params.quicSecurity = vless ? node.host || node.serverName : node.host;
      params.key = vless ? node.quicKey : node.path;
      break;
  }
  Object.assign(params, {
    fm: node.xrayFm,
    ech: node.ech,
    pcs: node.xrayPcs,
    vcn: node.xrayVcn,
    ...(vless ? { spx: node.xraySpx } : {}),
  });

  return query(params);
}

export function shareLink(node: ProxyNode): string | undefined {
  const address = `${host(node.server)}:${node.port}`;
  const name = node.name ? `#${encodeURIComponent(node.name)}` : '';

  switch (node.protocol) {
    case 'ss': {
      const credentials = node.encryption?.startsWith('2022-')
        ? `${encodeURIComponent(node.encryption)}:${encodeURIComponent(node.password ?? '')}`
        : base64(`${node.encryption}:${node.password}`, true);

      return `ss://${credentials}@${address}${node.plugin ? `/?plugin=${encodeURIComponent([node.plugin, ...(node.pluginOptions ?? [])].join(';'))}` : ''}${name}`;
    }
    case 'ssr': {
      const payload = `${host(node.server)}:${node.port}:${node.ssrProtocol}:${node.encryption}:${node.obfs}:${base64(node.password ?? '', true)}/?group=${base64(node.sourceGroup ?? '', true)}&remarks=${base64(node.name, true)}&obfsparam=${base64(node.obfsParam ?? '', true)}&protoparam=${base64(node.ssrProtocolParam ?? '', true)}`;

      return `ssr://${base64(payload, true)}`;
    }
    case 'vmess': {
      const payload: TargetObject = {
        v: '2',
        ps: node.name,
        add: node.server,
        port: String(node.port),
        type: (node.transport === 'grpc' || node.transport === 'xhttp' ? node.mode : node.headerType) || 'none',
        id: node.uuid ?? '',
        aid: String(node.alterId ?? 0),
        scy: node.encryption || 'auto',
        net: node.transport || 'tcp',
        path:
          node.transport === 'quic'
            ? (node.quicKey ?? '')
            : node.transport === 'grpc' && node.serviceName
              ? node.serviceName
              : (node.path ?? ''),
        host: node.transport === 'quic' ? (node.quicSecurity ?? '') : (node.host ?? ''),
        tls: node.tls ? (node.realityPublicKey ? 'reality' : 'tls') : '',
      };

      for (const [key, value] of Object.entries({
        sni: node.serverName,
        alpn: node.alpn?.join(','),
        fp: node.fingerprint,
        pbk: node.realityPublicKey,
        sid: node.realityShortId,
        authority: node.xrayAuthority,
        extra: node.xrayExtra,
        fm: node.xrayFm,
      })) {
        nonempty(payload, key, value);
      }

      return `vmess://${base64(JSON.stringify(payload))}`;
    }
    case 'hysteria2': {
      const params = {
        insecure: node.allowInsecure ? '1' : '0',
        obfs: node.obfs,
        'obfs-password': node.obfsPassword,
        sni: node.serverName,
        pinSHA256: node.certificatePin || node.fingerprint,
        ech: node.ech,
        minPacketSize: node.minPacketSize,
        maxPacketSize: node.maxPacketSize,
      };

      if (node.realmUrl) {
        const suffix = query({ ...params, auth: node.password });

        return `hysteria2+${node.realmUrl}${node.realmUrl.includes('?') ? suffix.replace('?', '&') : suffix}${name}`;
      }

      return `hysteria2://${node.password ? `${encodeURIComponent(node.password)}@` : ''}${host(node.server)}:${node.portRanges?.join(',') || node.port}/${query(params)}${name}`;
    }
    case 'vless':
      return `vless://${node.uuid || '00000000-0000-0000-0000-000000000000'}@${address}${xrayQuery(node)}${name}`;
    case 'trojan':
      return `trojan://${encodeURIComponent(node.password ?? '')}@${address}${xrayQuery(node)}${name}`;
    default:
      return;
  }
}
