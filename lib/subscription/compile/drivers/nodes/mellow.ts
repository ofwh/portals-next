import { query, shareLink } from './links';
import type { ProxyNode } from '../../../types/proxy-node';

export function mellowNode(node: ProxyNode): string | undefined {
  if (node.protocol === 'ss') {
    return node.plugin ? undefined : `${node.name}, ss, ${shareLink({ ...node, name: '' })?.replace(/#$/, '')}`;
  }

  if (node.protocol === 'vmess') {
    return `${node.name}, vmess1, vmess1://${node.uuid}@${node.server}:${node.port}${node.path ?? ''}${query({ network: node.transport ?? 'tcp', 'ws.host': node.transport === 'ws' ? node.host : undefined, 'http.host': node.transport === 'http' ? node.host : undefined, 'quic.security': node.quicSecurity, 'quic.key': node.quicKey, tls: node.tls ?? false, 'tls.servername': node.tls ? node.host : undefined, 'tls.allowinsecure': node.allowInsecure, 'sockopt.tcpfastopen': node.tcpFastOpen })}`;
  }

  if (node.protocol === 'socks5' || node.protocol === 'http') {
    return `${node.name}, builtin, ${node.protocol === 'socks5' ? 'socks' : 'http'}, address=${node.server}, port=${node.port}, user=${node.username ?? ''}, pass=${node.password ?? ''}`;
  }

  return;
}
