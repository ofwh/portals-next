import { commonSafe, safe } from '../../shared/ini';
import type { NodeSource } from '../../types';

export function validate(node: Readonly<NodeSource>): boolean {
  return (
    commonSafe(node) &&
    safe(node.password) &&
    (!['vmess', 'vless', 'trojan', 'anytls'].includes(node.protocol) ||
      [node.path, node.realityPublicKey, node.realityShortId].every((value) => safe(value)))
  );
}
