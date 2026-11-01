import type { ProxyNode } from '@/lib/types/subscriptions/nodes';

export function formatLink(node: ProxyNode): string {
  if (node.type === 'Shadowsocks') {
    return `ss://${btoa(unescape(encodeURIComponent(`${node.encryptMethod}:${node.password}`)))}@${node.hostname.includes(':') ? `[${node.hostname}]` : node.hostname}:${node.port}#${encodeURIComponent(node.remark)}`;
  }

  if (node.type === 'VMess') {
    return `vmess://${btoa(unescape(encodeURIComponent(JSON.stringify({ v: '2', ps: node.remark, add: node.hostname, port: String(node.port), id: node.userId, aid: String(node.alterId), scy: node.encryptMethod, net: node.transferProtocol || 'tcp', host: node.host, path: node.path, tls: node.tlsSecure ? 'tls' : '', sni: node.serverName }))))}`;
  }

  const names: Partial<Record<ProxyNode['type'], string>> = {
    VLESS: 'vless',
    Trojan: 'trojan',
    Hysteria2: 'hysteria2',
    AnyTLS: 'anytls',
  };
  const scheme = names[node.type];

  if (!scheme) {
    throw new Error(`Protocol ${node.type} is not supported by this link adapter`);
  }

  const url = new URL(`${scheme}://${node.hostname.includes(':') ? `[${node.hostname}]` : node.hostname}:${node.port}`);

  url.username = node.type === 'VLESS' ? node.userId : node.password;
  url.hash = node.remark;
  if (node.serverName) {
    url.searchParams.set('sni', node.serverName);
  }

  if (node.transferProtocol) {
    url.searchParams.set('type', node.transferProtocol);
  }

  if (node.path) {
    url.searchParams.set('path', node.path);
  }

  if (node.host) {
    url.searchParams.set('host', node.host);
  }

  if (node.flow) {
    url.searchParams.set('flow', node.flow);
  }

  if (node.tlsSecure) {
    url.searchParams.set('security', node.publicKey ? 'reality' : 'tls');
  }

  if (node.publicKey) {
    url.searchParams.set('pbk', node.publicKey);
  }

  if (node.shortId) {
    url.searchParams.set('sid', node.shortId);
  }

  return url.toString();
}
