import { isIP } from 'node:net';
import type { ProxyNode } from '../../../types/proxy-node';
import type { IniDocument } from '../../../types/template';
import { host, writeSection } from '../shared';

export function wireguard(node: ProxyNode, document: IniDocument, index: number, loon: boolean): string {
  const addresses = (node.addresses ?? []).map((address) => address.split('/')[0]);

  if (loon) {
    let output = 'wireguard';

    for (const address of addresses) {
      output += `, ${isIP(address) === 6 ? 'interface-ipV6' : 'interface-ip'}=${address}`;
    }
    output += `, private-key="${node.privateKey}"`;
    for (const address of node.dns ?? []) {
      output += `, ${isIP(address) === 6 ? 'dnsV6' : 'dns'}=${address}`;
    }
    if (node.mtu) {
      output += `, mtu=${node.mtu}`;
    }

    if (node.keepAlive) {
      output += `, keepalive=${node.keepAlive}`;
    }

    return `${output}, peers=[{public-key="${node.publicKey}",${node.preSharedKey ? `preshared-key="${node.preSharedKey}",` : ''}allowed-ips="${node.allowedIPs?.join(',') || '0.0.0.0/0,::/0'}",endpoint=${host(node.server)}:${node.port}${node.reserved?.length ? `,reserved=[${node.reserved.join(',')}]` : ''}}]`;
  }

  let name = `subscription-${index + 1}`;

  while (document.sections.some((section) => section.name === `WireGuard ${name}`)) {
    name += '-';
  }
  const values = [`private-key = ${node.privateKey}`];

  for (const address of addresses) {
    values.push(`${isIP(address) === 6 ? 'self-ip-v6' : 'self-ip'} = ${address}`);
  }
  if (node.dns?.length) {
    values.push(`dns-server = ${node.dns.join(',')}`);
  }

  if (node.mtu) {
    values.push(`mtu = ${node.mtu}`);
  }

  values.push(
    `peer = (public-key=${node.publicKey},${node.preSharedKey ? `pre-shared-key=${node.preSharedKey},` : ''}allowed-ips="${node.allowedIPs?.join(',') || '0.0.0.0/0, ::/0'}",endpoint=${host(node.server)}:${node.port}${node.keepAlive ? `,keepalive=${node.keepAlive}` : ''})`,
  );
  writeSection(document, `WireGuard ${name}`, values);

  return `wireguard, section-name=${name}${node.testUrl ? `, test-url=${node.testUrl}` : ''}`;
}
