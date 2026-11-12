import { commonSafe, safe } from './ini-shared';
import { loonNode } from './loon';
import { quanxNode } from './quanx';
import { surgeNode } from './surge';
import type { CompileTarget } from '../../../types/compile';
import type { ProxyNode } from '../../../types/proxy-node';
import type { IniDocument } from '../../../types/template';

export const iniProtocols = {
  surge: [
    'ss',
    'ssr',
    'vmess',
    'trojan',
    'snell',
    'socks5',
    'http',
    'https',
    'hysteria2',
    'tuic',
    'anytls',
    'wireguard',
  ],
  surfboard: ['ss', 'vmess', 'socks5', 'http', 'https', 'trojan', 'wireguard'],
  loon: ['ss', 'ssr', 'vmess', 'vless', 'trojan', 'http', 'https', 'socks5', 'wireguard', 'hysteria2', 'anytls'],
  quanx: ['ss', 'ssr', 'vmess', 'vless', 'trojan', 'http', 'https', 'socks5', 'anytls'],
} as const;

export function iniNode(
  node: ProxyNode,
  target: CompileTarget,
  document: IniDocument,
  index: number,
  surgeSsrPath?: string,
): string | undefined {
  if (
    !commonSafe(node) ||
    ![node.username, node.serverName, node.host, node.encryption].every((value) => safe(value))
  ) {
    return;
  }

  if (target === 'surge' || target === 'surfboard') {
    return surgeNode(node, document, index, target === 'surfboard', surgeSsrPath);
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

  return;
}
