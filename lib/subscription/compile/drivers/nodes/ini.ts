import { commonSafe, safe } from './ini-shared';
import { loonNode } from './loon';
import { mellowNode } from './mellow';
import { quanxNode } from './quanx';
import { surgeNode } from './surge';
import type { CompileTarget } from '../../../types/compile';
import type { ProxyNode } from '../../../types/proxy-node';
import type { IniDocument } from '../../../types/template';

export const iniProtocols = {
  surge: ['ss', 'socks5', 'http', 'https'],
  surfboard: ['ss', 'vmess', 'socks5', 'http', 'https', 'trojan', 'wireguard'],
  loon: ['ss', 'ssr', 'vmess', 'vless', 'trojan', 'http', 'https', 'socks5', 'wireguard', 'hysteria2', 'anytls'],
  quanx: ['ss', 'ssr', 'vmess', 'vless', 'trojan', 'http', 'https', 'socks5', 'anytls'],
  mellow: ['ss', 'vmess', 'socks5', 'http'],
} as const;

export function iniNode(
  node: ProxyNode,
  target: CompileTarget,
  document: IniDocument,
  index: number,
): string | undefined {
  if (
    !commonSafe(node) ||
    ![node.username, node.serverName, node.host, node.encryption].every((value) => safe(value))
  ) {
    return;
  }

  if (target === 'surge' || target === 'surfboard') {
    return surgeNode(node, document, index, target === 'surfboard');
  }

  if (target === 'loon') {
    return loonNode(node, document, index);
  }

  if (!safe(node.password)) {
    return;
  }

  if (target === 'quanx') {
    return quanxNode(node);
  }

  if (target === 'mellow') {
    return mellowNode(node);
  }

  return;
}
