import { plainXray, safe } from './ini-shared';
import { wireguard } from './wireguard';
import type { ProxyNode } from '../../../types/proxy-node';
import type { IniDocument } from '../../../types/template';
import { mbps } from '../shared';

export function loonNode(node: ProxyNode, document: IniDocument, index: number): string | undefined {
  let value: string;
  const transport = node.transport ?? 'tcp';
  const tls = node.tls ?? false;

  switch (node.protocol) {
    case 'ss':
      if (!safe(node.password, true) || (node.plugin && !['simple-obfs', 'obfs-local'].includes(node.plugin))) {
        return;
      }

      value = `Shadowsocks,${node.server},${node.port},${node.encryption},"${node.password}"`;
      if (node.pluginOptions?.length) {
        value += `,${node.pluginOptions.join(';').replaceAll(';obfs-host=', ',').replace('obfs=', '')}`;
      }

      break;
    case 'ssr':
      value = `ShadowsocksR,${node.server},${node.port},${node.encryption},"${node.password}",protocol=${node.ssrProtocol},protocol-param=${node.ssrProtocolParam ?? ''},obfs=${node.obfs},obfs-param=${node.obfsParam ?? ''}`;
      break;
    case 'vmess':
    case 'vless':
    case 'trojan': {
      if (
        !plainXray(node) ||
        !['tcp', 'ws', 'http'].includes(transport) ||
        (node.packetEncoding && node.packetEncoding !== 'none') ||
        !safe(node.path) ||
        !safe(node.host)
      ) {
        return;
      }

      if (node.protocol !== 'trojan' && node.alpn?.length) {
        return;
      }

      if (node.protocol === 'trojan' && (!tls || (node.alpn?.length ?? 0) > 1 || node.flow || node.realityPublicKey)) {
        return;
      }

      if (node.protocol === 'vless' && node.encryption && node.encryption !== 'none') {
        return;
      }

      value =
        node.protocol === 'vmess'
          ? `vmess,${node.server},${node.port},${node.encryption},"${node.uuid}",transport=${transport},alterId=${node.alterId ?? 0}`
          : `${node.protocol === 'vless' ? 'VLESS' : 'trojan'},${node.server},${node.port},"${node.protocol === 'vless' ? node.uuid : node.password}"`;
      if (node.protocol === 'vless') {
        if (node.realityPublicKey) {
          if (!tls || transport !== 'tcp' || node.flow !== 'xtls-rprx-vision' || !node.serverName) {
            return;
          }

          value += `,transport=tcp,flow=xtls-rprx-vision,public-key="${node.realityPublicKey}"${node.realityShortId ? `,short-id=${node.realityShortId}` : ''}`;
        } else {
          if (node.flow || node.realityShortId) {
            return;
          }

          value += `,transport=${transport}`;
        }
      }

      if (transport === 'ws' || transport === 'http') {
        value += `${node.protocol === 'trojan' ? `,transport=${transport}` : ''},path=${node.path ?? ''},host=${node.host ?? ''}`;
      }

      if (node.protocol !== 'trojan') {
        value += `,over-tls=${tls}`;
      }

      if (tls && node.serverName) {
        value += `,sni=${node.serverName}`;
      }

      if (tls && node.fingerprint) {
        value += `,tls-profile=${node.fingerprint}`;
      }

      if (node.protocol === 'trojan' && node.alpn?.length) {
        value += `,alpn=${node.alpn[0]}`;
      }

      if (node.allowInsecure !== undefined) {
        value += `,skip-cert-verify=${node.allowInsecure}`;
      }

      break;
    }
    case 'http':
    case 'https':
      value = `${node.protocol},${node.server},${node.port},${node.username ?? ''},"${node.password ?? ''}"`;
      if (node.protocol === 'https') {
        if (node.host) {
          value += `,tls-name=${node.host}`;
        }

        if (node.allowInsecure !== undefined) {
          value += `,skip-cert-verify=${node.allowInsecure}`;
        }
      }

      break;
    case 'socks5':
      value = `socks5,${node.server},${node.port}${node.username && node.password ? `,${node.username},"${node.password}"` : ''},over-tls=${tls}`;
      if (tls) {
        if (node.host) {
          value += `,tls-name=${node.host}`;
        }

        if (node.allowInsecure !== undefined) {
          value += `,skip-cert-verify=${node.allowInsecure}`;
        }
      }

      break;
    case 'anytls':
      if (
        node.alpn?.length ||
        node.underlyingProxy ||
        node.tls13 !== undefined ||
        (node.idleSessionCheckIntervalSeconds ?? 30) !== 30 ||
        (node.idleSessionTimeoutSeconds ?? 30) !== 30 ||
        node.minIdleSession
      ) {
        return;
      }

      value = `AnyTLS,${node.server},${node.port},"${node.password}"${node.serverName ? `,sni=${node.serverName}` : ''}${node.fingerprint ? `,tls-profile=${node.fingerprint}` : ''}${node.allowInsecure !== undefined ? `,skip-cert-verify=${node.allowInsecure}` : ''},block-quic=false`;
      break;
    case 'wireguard':
      value = wireguard(node, document, index, true);
      break;
    case 'hysteria2':
      if (
        node.up ||
        node.portRanges?.some((range) => range !== String(node.port)) ||
        node.ech ||
        node.alpn?.length ||
        node.publicKey ||
        node.hopInterval ||
        node.realmUrl ||
        node.minPacketSize ||
        node.maxPacketSize ||
        ((node.certificatePin || node.fingerprint) && node.allowInsecure) ||
        (node.obfs && (node.obfs !== 'salamander' || !node.obfsPassword)) ||
        (node.down && !mbps(node.down))
      ) {
        return;
      }

      value = `Hysteria2,${node.server},${node.port},"${node.password}"${node.serverName ? `,sni=${node.serverName}` : ''}${node.certificatePin || node.fingerprint ? `,tls-cert-sha256=${node.certificatePin || node.fingerprint}` : ''}${node.down ? `,download-bandwidth=${mbps(node.down)}` : ''}${node.obfs === 'salamander' ? `,salamander-password="${node.obfsPassword}"` : ''}${node.allowInsecure !== undefined ? `,skip-cert-verify=${node.allowInsecure}` : ''}`;
      break;
    default:
      return;
  }
  if (node.tcpFastOpen !== undefined) {
    value += `,fast-open=${node.tcpFastOpen}`;
  }

  if (node.udp !== undefined) {
    value += `,udp=${node.udp}`;
  }

  return `${node.name} = ${value}`;
}
