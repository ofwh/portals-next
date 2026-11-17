import { commonSafe, safe, wireguardSafe } from '../../shared/ini';
import type { NodeSource } from '../../types';

function loonSafe(node: Readonly<NodeSource>): boolean {
  if (!safe(node.username, true) || !safe(node.uuid, true)) {
    return false;
  }

  if (node.protocol === 'wireguard') {
    return wireguardSafe(node);
  }

  if (['vmess', 'vless', 'trojan'].includes(node.protocol) && !safe(node.path)) {
    return false;
  }

  if (node.protocol === 'vmess' || node.protocol === 'vless') {
    return true;
  }

  return safe(node.password, true) && (node.protocol !== 'hysteria2' || safe(node.obfsPassword, true));
}

export function validate(node: Readonly<NodeSource>): boolean {
  return commonSafe(node) && loonSafe(node);
}
