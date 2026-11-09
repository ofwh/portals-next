import { safe } from './ini-shared';
import { wireguard } from './wireguard';
import type { ProxyNode } from '../../../types/proxy-node';
import type { IniDocument } from '../../../types/template';

export function surgeNode(
  node: ProxyNode,
  document: IniDocument,
  index: number,
  surfboard: boolean,
): string | undefined {
  let value: string;

  switch (node.protocol) {
    case 'ss':
      if (
        !safe(node.password) ||
        !safe(node.encryption) ||
        (node.plugin && !['simple-obfs', 'obfs-local'].includes(node.plugin))
      ) {
        return;
      }

      value = `ss, ${node.server}, ${node.port}, encrypt-method=${node.encryption}, password=${node.password}`;
      if (node.pluginOptions?.length) {
        value += `,${node.pluginOptions.join(',')}`;
      }

      break;
    case 'socks5':
      value = `socks5, ${node.server}, ${node.port}${node.username ? `, username=${node.username}` : ''}${node.password ? `, password=${node.password}` : ''}`;
      if (node.allowInsecure !== undefined) {
        value += `, skip-cert-verify=${node.allowInsecure}`;
      }

      break;
    case 'http':
    case 'https':
      value =
        surfboard && node.protocol === 'https'
          ? `https, ${node.server}, ${node.port}, ${node.username ?? ''}, ${node.password ?? ''}`
          : `http, ${node.server}, ${node.port}${node.username ? `, username=${node.username}` : ''}${node.password ? `, password=${node.password}` : ''}, tls=${node.tls ?? false}`;
      if (node.allowInsecure !== undefined) {
        value += `, skip-cert-verify=${node.allowInsecure}`;
      }

      break;
    case 'vmess':
      if (!surfboard || !['tcp', 'ws'].includes(node.transport ?? 'tcp')) {
        return;
      }

      value = `vmess, ${node.server}, ${node.port}, username=${node.uuid}, tls=${node.tls ?? false}, vmess-aead=${!node.alterId}`;
      if (node.tls && node.tls13 !== undefined) {
        value += `, tls13=${node.tls13}`;
      }

      if (node.transport === 'ws') {
        value += `, ws=true, ws-path=${node.path ?? ''}, sni=${node.host || node.server}`;
        const headers = [node.host ? `Host:${node.host}` : '', node.edge ? `Edge:${node.edge}` : ''].filter(Boolean);

        if (headers.length) {
          value += `, ws-headers=${headers.join('|')}`;
        }
      }

      if (node.allowInsecure !== undefined) {
        value += `, skip-cert-verify=${node.allowInsecure}`;
      }

      break;
    case 'trojan':
      if (!surfboard) {
        return;
      }

      value = `trojan, ${node.server}, ${node.port}, password=${node.password}${node.serverName || node.host ? `, sni=${node.serverName || node.host}` : ''}`;
      if (node.allowInsecure !== undefined) {
        value += `, skip-cert-verify=${node.allowInsecure}`;
      }

      break;
    case 'wireguard':
      if (!surfboard) {
        return;
      }

      value = wireguard(node, document, index, false);
      break;
    default:
      return;
  }
  if (node.tcpFastOpen !== undefined) {
    value += `, tfo=${node.tcpFastOpen}`;
  }

  if (node.udp !== undefined) {
    value += `, udp-relay=${node.udp}`;
  }

  if (node.underlyingProxy) {
    value += `, underlying-proxy=${node.underlyingProxy}`;
  }

  return `${node.name} = ${value}`;
}
