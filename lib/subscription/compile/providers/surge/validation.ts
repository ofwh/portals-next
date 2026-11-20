import { commonSafe, safe, wireguardSafe } from '../../shared/ini';
import type { NodeSource } from '../../types';

function surgeSafe(node: Readonly<NodeSource>): boolean {
  if (!safe(node.underlyingProxy)) {
    return false;
  }

  switch (node.protocol) {
    case 'ss':
      return safe(node.password) && !node.pluginOptions?.some((value) => !safe(value));
    case 'socks5':
    case 'http':
    case 'https':
    case 'trojan':
      return safe(node.password);
    case 'vmess':
    case 'vless':
      return [
        node.uuid,
        node.path,
        node.edge,
        node.mode,
        node.xrayAuthority,
        node.flow,
        node.realityPublicKey,
        node.realityShortId,
      ].every((value) => safe(value));
    case 'wireguard':
      return wireguardSafe(node);
    case 'hysteria2':
    case 'tuic':
    case 'anytls':
      return [
        node.password,
        node.token,
        node.alpn?.[0],
        node.certificatePin,
        node.fingerprint,
        node.obfsPassword,
      ].every((value) => safe(value));
    case 'snell':
      return [node.password, node.path, node.shadowTlsPassword, node.shadowTlsSni].every((value) => safe(value));
    case 'ssr':
      return [
        node.server,
        node.encryption,
        node.password,
        node.obfs,
        node.ssrProtocol,
        node.obfsParam,
        node.ssrProtocolParam,
      ].every((value) => safe(value, true) && !value?.includes('\\'));
    default:
      return true;
  }
}

export function validate(node: Readonly<NodeSource>): boolean {
  return commonSafe(node) && surgeSafe(node);
}
