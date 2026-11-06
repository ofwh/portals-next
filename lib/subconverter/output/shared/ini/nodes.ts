import logger from '@/lib/api/logger';
import { token } from './token';
import type { IniNodeProjection } from './types';
import { camelCase } from '../../../providers/schema';
import type { IniNode } from '../../../types/providers/ini';
import { fail, OUTPUT_ERROR } from '../errors';

const nativeNames = new Map(
  [
    'aead',
    'alpn',
    'alterid',
    'block-quic',
    'congestion-controller',
    'custom',
    'direct',
    'dns',
    'dns-server',
    'dnsv6',
    'download-bandwidth',
    'encrypt-method',
    'fast-open',
    'fingerprint',
    'flow',
    'fp',
    'gecko-password',
    'grpc-mode',
    'hop-interval',
    'host',
    'interface',
    'interface-ip',
    'interface-ip-v6',
    'interface-ipv6',
    'keepalive',
    'method',
    'mode',
    'mtu',
    'obfs',
    'obfs-host',
    'obfs-uri',
    'over-tls',
    'password',
    'path',
    'peer',
    'peers',
    'port-hopping',
    'port-hopping-interval',
    'pre-shared-key',
    'preshared-key',
    'private-key',
    'protocol',
    'protocol-param',
    'psk',
    'public-key',
    'reality-base64-pubkey',
    'reality-hex-shortid',
    'reject',
    'reject-tinygif',
    'reuse',
    'salamander-password',
    'section-name',
    'self-ip',
    'self-ip-v6',
    'self-ipv6',
    'server-cert-fingerprint-sha256',
    'server-ports',
    'service-name',
    'shadow-tls-password',
    'shadow-tls-sni',
    'shadow-tls-version',
    'short-id',
    'skip-cert-verify',
    'sni',
    'ssr-protocol',
    'ssr-protocol-param',
    'tag',
    'test-url',
    'tfo',
    'tls',
    'tls-alpn',
    'tls-cert-sha256',
    'tls-host',
    'tls-name',
    'tls-profile',
    'tls-pubkey-sha256',
    'tls-verification',
    'tls13',
    'token',
    'transport',
    'udp',
    'udp-port',
    'udp-relay',
    'udp-relay-mode',
    'underlying-proxy',
    'username',
    'uuid',
    'version',
    'vless-flow',
    'vmess-aead',
    'ws',
    'ws-headers',
    'ws-path',
  ].map((key) => [camelCase(key), key]),
);

export function projectNode(node: IniNode, index: number, style: 'surge' | 'loon' | 'quanx'): IniNodeProjection {
  if (node.wireGuard) {
    if (style === 'loon') {
      return projectLoonWireGuard(node, index);
    }

    if (style !== 'surge') {
      logger.warn(OUTPUT_ERROR.UNSUPPORTED_WIREGUARD_LAYOUT, { data: node, field: 'wireGuard' });

      return fail('node', index, 'wireGuard', OUTPUT_ERROR.UNSUPPORTED_WIREGUARD_LAYOUT);
    }

    const section = `generated-${index}`;
    const settings = node.wireGuard;
    const lines = [`private-key = ${token(settings.privateKey)}`];

    for (const address of settings.addresses) {
      lines.push(`${address.includes(':') ? 'self-ip-v6' : 'self-ip'} = ${token(address.split('/')[0])}`);
    }
    if (settings.mtu !== undefined) {
      lines.push(`mtu = ${settings.mtu}`);
    }

    if (settings.dnsServers?.length) {
      lines.push(`dns-server = ${token(settings.dnsServers.join(', '))}`);
    }

    if (settings.keepAlive !== undefined) {
      logger.warn(OUTPUT_ERROR.UNSUPPORTED_WIREGUARD_KEEPALIVE, { data: node, field: 'keepAlive' });

      return fail('node', index, 'keepAlive', OUTPUT_ERROR.UNSUPPORTED_WIREGUARD_KEEPALIVE);
    }

    lines.push(
      `peer = ${settings.peers
        .map((peer) => {
          const endpoint = `${peer.server.includes(':') ? `[${peer.server}]` : peer.server}:${peer.port}`;
          const fields = [`public-key = ${token(peer.publicKey)}`, `endpoint = ${token(endpoint)}`];

          if (peer.preSharedKey !== undefined) {
            fields.push(`preshared-key = ${token(peer.preSharedKey)}`);
          }

          if (peer.allowedIps?.length) {
            fields.push(`allowed-ips = ${token(peer.allowedIps.join(', '))}`);
          }

          if (peer.reserved?.length) {
            fields.push(`client-id = ${peer.reserved.join('/')}`);
          }

          if (peer.keepAlive !== undefined) {
            fields.push(`keepalive = ${peer.keepAlive}`);
          }

          return `(${fields.join(', ')})`;
        })
        .join(',')}`,
    );

    return {
      lines: [`${token(node.name)} = wireguard, section-name=${token(section)}`],
      sections: [{ name: `WireGuard ${section}`, lines }],
    };
  }

  const options = Object.entries(node.options).flatMap(([key, value]) => {
    if (value === undefined) {
      return [];
    }

    const native = nativeNames.get(key);

    if (!native) {
      logger.warn(OUTPUT_ERROR.UNSUPPORTED_INI_OPTION, { data: node, field: key });

      return fail('node', index, key, OUTPUT_ERROR.UNSUPPORTED_INI_OPTION);
    }

    if (style === 'quanx' && key === 'skipCertVerify') {
      return [`tls-verification=${value === 'true' ? 'false' : 'true'}`];
    }

    return [`${style === 'loon' && key === 'alterid' ? 'alterId' : native}=${token(value)}`];
  });
  const left = style === 'quanx' ? node.type : token(node.name);
  const fields = [...(style === 'quanx' ? [] : [node.type]), ...node.arguments.map(token), ...options];

  return { lines: [`${left} = ${fields.join(', ')}`], sections: [] };
}

function projectLoonWireGuard(node: IniNode, index: number): IniNodeProjection {
  const settings = node.wireGuard!;
  const options: string[] = [];
  const keepAlive = settings.peers[0]?.keepAlive ?? settings.keepAlive;

  if (settings.peers.some((peer) => peer.keepAlive !== undefined && peer.keepAlive !== keepAlive)) {
    logger.warn(OUTPUT_ERROR.INCONSISTENT_LOON_WIREGUARD_KEEPALIVE, { data: node, field: 'keepAlive' });

    return fail('node', index, 'keepAlive', OUTPUT_ERROR.INCONSISTENT_LOON_WIREGUARD_KEEPALIVE);
  }

  for (const address of settings.addresses) {
    options.push(`${address.includes(':') ? 'interface-ipV6' : 'interface-ip'}=${token(address.split('/')[0])}`);
  }
  options.push(`private-key=${token(settings.privateKey)}`);
  for (const dns of settings.dnsServers ?? []) {
    options.push(`${dns.includes(':') ? 'dnsV6' : 'dns'}=${token(dns)}`);
  }
  if (settings.mtu !== undefined) {
    options.push(`mtu=${settings.mtu}`);
  }

  if (keepAlive !== undefined) {
    options.push(`keepalive=${keepAlive}`);
  }

  const peers = settings.peers.map((peer) => {
    const fields = [
      `public-key=${token(peer.publicKey)}`,
      `endpoint=${token(`${peer.server.includes(':') ? `[${peer.server}]` : peer.server}:${peer.port}`)}`,
    ];

    if (peer.preSharedKey !== undefined) {
      fields.push(`preshared-key=${token(peer.preSharedKey)}`);
    }

    if (peer.allowedIps?.length) {
      fields.push(`allowed-ips=${token(peer.allowedIps.join(', '))}`);
    }

    if (peer.reserved?.length) {
      fields.push(`reserved=[${peer.reserved.join(',')}]`);
    }

    return `{${fields.join(',')}}`;
  });

  options.push(`peers=[${peers.join(',')}]`);

  return { lines: [`${token(node.name)} = wireguard, ${options.join(', ')}`], sections: [] };
}
