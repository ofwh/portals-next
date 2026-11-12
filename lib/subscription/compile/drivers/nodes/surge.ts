import { isIP } from 'node:net';
import { safe } from './ini-shared';
import { wireguard } from './wireguard';
import type { ProxyNode } from '../../../types/proxy-node';
import type { IniDocument } from '../../../types/template';
import { mbps } from '../shared';

export function surgeNode(
  node: ProxyNode,
  document: IniDocument,
  index: number,
  surfboard: boolean,
  surgeSsrPath?: string,
): string | undefined {
  let value: string | undefined;
  const endpoint = `${node.server}, ${node.port}`;

  if (!surfboard && (!Number.isInteger(node.port) || !safe(node.underlyingProxy))) {
    return;
  }

  switch (node.protocol) {
    case 'ss':
      if (
        !safe(node.password) ||
        !safe(node.encryption) ||
        (node.plugin && !['simple-obfs', 'obfs-local'].includes(node.plugin)) ||
        (!surfboard && node.pluginOptions?.some((option) => !safe(option)))
      ) {
        return;
      }

      value = `ss, ${node.server}, ${node.port}, encrypt-method=${node.encryption}, password=${node.password}`;
      if (node.pluginOptions?.length) {
        value += `,${node.pluginOptions.join(',')}`;
      }

      break;
    case 'socks5':
      if (!surfboard && !safe(node.password)) {
        return;
      }

      value = `socks5, ${node.server}, ${node.port}${node.username ? `, username=${node.username}` : ''}${node.password ? `, password=${node.password}` : ''}`;
      if (node.allowInsecure !== undefined) {
        value += `, skip-cert-verify=${node.allowInsecure}`;
      }

      break;
    case 'http':
    case 'https':
      if (!surfboard && !safe(node.password)) {
        return;
      }

      value =
        surfboard && node.protocol === 'https'
          ? `https, ${node.server}, ${node.port}, ${node.username ?? ''}, ${node.password ?? ''}`
          : `http, ${node.server}, ${node.port}${node.username ? `, username=${node.username}` : ''}${node.password ? `, password=${node.password}` : ''}, tls=${node.tls ?? (!surfboard && node.protocol === 'https')}`;
      if (node.allowInsecure !== undefined) {
        value += `, skip-cert-verify=${node.allowInsecure}`;
      }

      break;
    case 'vmess':
      if (
        !['tcp', 'ws'].includes(node.transport ?? 'tcp') ||
        (!surfboard &&
          (!node.uuid ||
            ![node.uuid, node.path, node.edge].every((field) => safe(field)) ||
            node.realityPublicKey ||
            node.ech ||
            node.disableSni ||
            (node.headerType && node.headerType !== 'none')))
      ) {
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
      if (
        !surfboard &&
        (!node.password ||
          !safe(node.password) ||
          (node.transport && node.transport !== 'tcp') ||
          node.tls === false ||
          node.realityPublicKey ||
          node.ech ||
          node.disableSni ||
          node.plugin ||
          node.encryption)
      ) {
        return;
      }

      value = `trojan, ${node.server}, ${node.port}, password=${node.password}${node.serverName || node.host ? `, sni=${node.serverName || node.host}` : ''}`;
      if (node.allowInsecure !== undefined) {
        value += `, skip-cert-verify=${node.allowInsecure}`;
      }

      break;
    case 'wireguard':
      value = surfboard ? wireguard(node, document, index, false) : surgeWireGuard(node, document, index);
      break;
    case 'hysteria2':
    case 'tuic':
    case 'anytls':
      value = !surfboard ? surgeQuic(node, endpoint) : undefined;
      break;
    case 'snell':
      value = !surfboard ? surgeSnell(node, endpoint) : undefined;
      break;
    case 'ssr':
      value = !surfboard ? surgeSsr(node, surgeSsrPath, index) : undefined;
      break;
    default:
      return;
  }
  if (value === undefined) {
    return;
  }

  if (node.tcpFastOpen !== undefined) {
    value += `, tfo=${node.tcpFastOpen}`;
  }

  if (node.udp !== undefined && node.protocol !== 'anytls') {
    value += `, udp-relay=${node.udp}`;
  }

  if (node.underlyingProxy) {
    value += `, underlying-proxy=${node.underlyingProxy}`;
  }

  return `${node.name} = ${value}`;
}

function tlsOptions(node: ProxyNode): string {
  return [
    node.allowInsecure === undefined ? '' : `skip-cert-verify=${node.allowInsecure}`,
    node.serverName ? `sni=${node.serverName}` : '',
    node.alpn?.[0] ? `alpn=${node.alpn[0]}` : '',
  ]
    .filter(Boolean)
    .map((option) => `, ${option}`)
    .join('');
}

function hopping(node: ProxyNode): string {
  const ports = node.portRanges ?? [];

  return ports.length && (ports.length > 1 || ports[0] !== String(node.port))
    ? `, port-hopping=${ports.join(';')}`
    : '';
}

function surgeQuic(node: ProxyNode, endpoint: string): string | undefined {
  if (
    node.tls === false ||
    node.realityPublicKey ||
    node.disableSni ||
    node.ech ||
    ![node.password, node.token, node.alpn?.[0], node.certificatePin, node.fingerprint, node.obfsPassword].every(
      (value) => safe(value),
    )
  ) {
    return;
  }

  if (node.protocol === 'tuic') {
    return node.token ? `tuic, ${endpoint}, token=${node.token}${tlsOptions(node)}${hopping(node)}` : undefined;
  }

  if (!node.password) {
    return;
  }

  if (node.protocol === 'anytls') {
    return `anytls, ${endpoint}, password=${node.password}${tlsOptions(node)}`;
  }

  if (
    node.realmUrl ||
    node.realmToken ||
    node.minPacketSize !== undefined ||
    node.maxPacketSize !== undefined ||
    ((node.obfs || node.obfsPassword) && (!node.obfsPassword || !['salamander', 'gecko'].includes(node.obfs ?? '')))
  ) {
    return;
  }

  const download = mbps(node.down);
  const pin = node.certificatePin || node.fingerprint;

  return `hysteria2, ${endpoint}, password=${node.password}${download === undefined ? '' : `, download-bandwidth=${download}`}${tlsOptions(node)}${pin ? `, server-cert-fingerprint-sha256=${pin}` : ''}${node.obfsPassword ? `, ${node.obfs}-password=${node.obfsPassword}` : ''}${hopping(node)}`;
}

function surgeSnell(node: ProxyNode, endpoint: string): string | undefined {
  const version = node.snellVersion ?? 1;
  const udpPort = node.snellUdpPort;
  const shadowVersion = node.shadowTlsVersion;

  if (
    !node.password ||
    !Number.isInteger(version) ||
    version < 1 ||
    version > 6 ||
    ![node.password, node.path, node.shadowTlsPassword, node.shadowTlsSni].every((value) => safe(value)) ||
    (node.obfs && !['http', 'tls', 'shadow-tls'].includes(node.obfs)) ||
    (version >= 4 && node.obfs === 'tls') ||
    (version === 6 && (node.obfs || node.host || node.path)) ||
    (node.path && node.obfs !== 'http') ||
    (node.snellMode && version !== 6) ||
    (udpPort !== undefined && (!Number.isInteger(udpPort) || udpPort < 1 || udpPort > 65535 || version < 3)) ||
    ((node.shadowTlsPassword || node.shadowTlsSni || shadowVersion !== undefined) &&
      (!node.shadowTlsPassword ||
        (node.obfs && node.obfs !== 'shadow-tls') ||
        (shadowVersion !== undefined && shadowVersion !== 2 && shadowVersion !== 3) ||
        (shadowVersion === 3 && !node.shadowTlsSni)))
  ) {
    return;
  }

  return [
    'snell',
    endpoint,
    `psk=${node.password}`,
    ...(node.obfs === 'http' || node.obfs === 'tls' ? [`obfs=${node.obfs}`] : []),
    ...(node.host && (node.obfs === 'http' || node.obfs === 'tls') ? [`obfs-host=${node.host}`] : []),
    ...(node.path ? [`obfs-uri=${node.path}`] : []),
    `version=${version}`,
    ...(node.snellReuse === undefined ? [] : [`reuse=${node.snellReuse}`]),
    ...(udpPort === undefined ? [] : [`udp-port=${udpPort}`]),
    ...(node.snellMode ? [`mode=${node.snellMode}`] : []),
    ...(node.shadowTlsPassword ? [`shadow-tls-password=${node.shadowTlsPassword}`] : []),
    ...(node.shadowTlsSni ? [`shadow-tls-sni=${node.shadowTlsSni}`] : []),
    ...(shadowVersion === undefined ? [] : [`shadow-tls-version=${shadowVersion}`]),
  ].join(', ');
}

function surgeSsr(node: ProxyNode, executable: string | undefined, index: number): string | undefined {
  const port = 1080 + index;

  if (!executable || port > 65535 || !node.encryption || !node.password || !node.obfs || !node.ssrProtocol) {
    return;
  }

  const args = [
    '-l',
    String(port),
    '-s',
    node.server,
    '-p',
    String(node.port),
    '-m',
    node.encryption,
    '-k',
    node.password,
    '-o',
    node.obfs,
    '-O',
    node.ssrProtocol,
  ];

  if (node.obfsParam) {
    args.push('-g', node.obfsParam);
  }

  if (node.ssrProtocolParam) {
    args.push('-G', node.ssrProtocolParam);
  }

  if (!args.every((arg) => safe(arg, true) && !arg.includes('\\'))) {
    return;
  }

  return `external, exec="${executable}", ${args.map((arg) => `args="${arg}"`).join(', ')}, local-port=${port}${isIP(node.server) ? `, addresses=${node.server}` : ''}`;
}

function surgeWireGuard(node: ProxyNode, document: IniDocument, index: number): string | undefined {
  if (
    !node.privateKey ||
    !node.publicKey ||
    !node.addresses?.length ||
    ![node.privateKey, node.publicKey, node.preSharedKey, node.testUrl, ...(node.dns ?? [])].every(
      (value) => safe(value) && !/["()]/.test(value ?? ''),
    ) ||
    [...node.addresses, ...(node.allowedIPs ?? [])].some((value) => !/^[:.\da-f]+(?:\/\d+)?$/i.test(value)) ||
    (node.reserved?.length &&
      (node.reserved.length !== 3 ||
        node.reserved.some((value) => !Number.isInteger(value) || value < 0 || value > 255)))
  ) {
    return;
  }

  return wireguard(node, document, index, false, true);
}
