import { Buffer } from 'node:buffer';
import { plainXray } from './ini-shared';
import type { ProxyNode } from '../../../types/proxy-node';
import { host, pluginOptions } from '../shared';

export function quanxNode(node: ProxyNode): string | undefined {
  const address = `${host(node.server)}:${node.port}`;
  let value: string;
  let verification = false;
  const reality = !!node.realityPublicKey;

  switch (node.protocol) {
    case 'ss': {
      value = `shadowsocks = ${address}, method=${node.encryption}, password=${node.password}`;
      if (node.plugin === 'simple-obfs' || node.plugin === 'obfs-local') {
        value += node.pluginOptions?.length ? `, ${node.pluginOptions.join(', ')}` : '';
      } else if (node.plugin === 'v2ray-plugin') {
        const options = pluginOptions(node);

        value += `, obfs=${options.mode === 'websocket' ? `ws${Object.hasOwn(options, 'tls') ? 's' : ''}` : ''}${options.host ? `, obfs-host=${options.host}` : ''}${options.path ? `, obfs-uri=${options.path}` : ''}`;
      } else if (node.plugin) {
        return;
      }

      break;
    }
    case 'ssr':
      value = `shadowsocks = ${address}, method=${node.encryption}, password=${node.password}, ssr-protocol=${node.ssrProtocol}${node.ssrProtocolParam ? `, ssr-protocol-param=${node.ssrProtocolParam}` : ''}, obfs=${node.obfs}${node.obfsParam ? `, obfs-host=${node.obfsParam}` : ''}`;
      break;
    case 'vmess':
    case 'vless':
    case 'trojan':
    case 'anytls': {
      const transport = node.transport ?? 'tcp';

      if (
        !plainXray({ ...node, tls13: undefined, xudp: undefined, headerType: undefined }) ||
        node.underlyingProxy ||
        node.serviceName ||
        node.mode ||
        (node.headerType && !['none', 'http'].includes(node.headerType)) ||
        !['tcp', 'ws'].includes(transport) ||
        (node.packetEncoding && node.packetEncoding !== 'none') ||
        (node.flow &&
          (node.protocol !== 'vless' || node.flow !== 'xtls-rprx-vision' || !reality || transport !== 'tcp'))
      ) {
        return;
      }

      if (node.protocol === 'trojan' && !node.tls && !reality) {
        return;
      }

      if (node.protocol === 'anytls' && (transport !== 'tcp' || node.path)) {
        return;
      }

      value = `${node.protocol} = ${address}, ${node.protocol === 'vmess' || node.protocol === 'vless' ? `method=${node.protocol === 'vmess' ? (node.encryption === 'auto' ? 'chacha20-ietf-poly1305' : node.encryption) : 'none'}, ` : ''}password=${node.protocol === 'vmess' || node.protocol === 'vless' ? node.uuid : node.password}`;
      if (node.protocol === 'vmess' && node.alterId) {
        value += ', aead=false';
      }

      const activeTls = node.tls || reality || node.protocol === 'anytls';

      if (transport === 'ws') {
        const httpHost = node.host || node.server;
        const tlsHost = node.serverName || node.server;

        if (activeTls && httpHost.toLowerCase() !== tlsHost.toLowerCase()) {
          return;
        }

        value += `, obfs=${activeTls ? 'wss' : 'ws'}${activeTls || node.host ? `, obfs-host=${activeTls ? httpHost : node.host}` : ''}${node.path ? `, obfs-uri=${node.path}` : ''}`;
      } else if (node.protocol === 'vmess' || node.protocol === 'vless') {
        if (node.headerType === 'http') {
          if (activeTls) {
            return;
          }

          value += `, obfs=http${node.host ? `, obfs-host=${node.host}` : ''}${node.path ? `, obfs-uri=${node.path}` : ''}`;
        } else if (activeTls) {
          value += `, obfs=over-tls${node.serverName ? `, obfs-host=${node.serverName}` : ''}`;
        }
      } else {
        value += `, over-tls=true${node.serverName ? `, tls-host=${node.serverName}` : ''}`;
      }

      if (reality) {
        if (
          !node.serverName ||
          !/^[A-Za-z0-9_-]{43}$/.test(node.realityPublicKey ?? '') ||
          (node.realityShortId && !/^(?:[a-f0-9]{2}){1,8}$/i.test(node.realityShortId))
        ) {
          return;
        }

        value += `, reality-base64-pubkey=${node.realityPublicKey}${node.realityShortId ? `, reality-hex-shortid=${node.realityShortId}` : ''}${node.flow ? `, vless-flow=${node.flow}` : ''}`;
      } else {
        if (!activeTls && node.alpn?.length) {
          return;
        }

        if (node.alpn?.some((item) => !item || Buffer.byteLength(item) > 255)) {
          return;
        }

        if (node.alpn?.length) {
          value += `, tls-alpn=${node.alpn.map((item) => Buffer.from([Buffer.byteLength(item)]).toString('hex') + Buffer.from(item).toString('hex')).join('')}`;
        }

        verification = !!activeTls;
      }

      break;
    }
    case 'http':
    case 'https':
      value = `http = ${address}, username=${node.username || 'none'}, password=${node.password || 'none'}, over-tls=${node.tls ?? false}`;
      verification = !!node.tls;
      break;
    case 'socks5':
      value = `socks5 = ${address}`;
      if (node.username && node.password) {
        value += `, username=${node.username}, password=${node.password}, over-tls=${node.tls ?? false}${node.tls ? `, tls-host=${node.host ?? ''}` : ''}`;
        verification = !!node.tls;
      }

      break;
    default:
      return;
  }
  if (reality) {
    value += ', fast-open=false';
  } else if (node.tcpFastOpen !== undefined) {
    value += `, fast-open=${node.tcpFastOpen}`;
  }

  if (node.udp !== undefined) {
    value += `, udp-relay=${node.udp}`;
  }

  if (verification && node.allowInsecure !== undefined) {
    value += `, tls-verification=${!node.allowInsecure}`;
  }

  if (verification && node.tls13 !== undefined) {
    value += `, tls13=${node.tls13}`;
  }

  return `${value}, tag=${node.name}`;
}
