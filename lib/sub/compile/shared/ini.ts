import { ipVersion } from '@chainsafe/is-ip';
import { computed, field } from './field';
import type { NodeSchema, NodeSource } from '../types';

export function plainXray(node: Readonly<NodeSource>): boolean {
  return (
    !node.edge &&
    !node.quicKey &&
    !node.quicSecurity &&
    !node.xrayExtra &&
    !node.xrayAuthority &&
    !node.xrayFm &&
    !node.xraySeed &&
    !node.xrayPcs &&
    !node.xrayVcn &&
    !node.ech &&
    !node.xudp &&
    node.tls13 === undefined &&
    (!node.headerType || node.headerType === 'none')
  );
}

export const base: NodeSchema = { name: 'name', type: 'protocol', server: 'server', port: 'port' };

export function firstAddress(node: Readonly<NodeSource>, family: 4 | 6, dns = false): string | undefined {
  return (dns ? node.dns : node.addresses)
    ?.map((value) => value.split('/')[0])
    .find((value) => ipVersion(value) === family);
}

export const wireguardInterface: NodeSchema = {
  'private-key': 'privateKey',
  'self-ip': computed((node) => firstAddress(node, 4)),
  'self-ip-v6': computed((node) => firstAddress(node, 6)),
  'dns-server': field('dns', { when: (_, node) => !!node.dns?.length, transform: (_, node) => node.dns?.join(',') }),
  mtu: field('mtu', { when: (value) => !!value }),
};

export function validWireguard(node: Readonly<NodeSource>): boolean {
  return (
    !!node.privateKey &&
    !!node.publicKey &&
    !!node.addresses?.length &&
    [...node.addresses, ...(node.allowedIPs ?? [])].every((value) => /^[:.\da-f]+(?:\/\d+)?$/i.test(value)) &&
    (!node.reserved?.length ||
      (node.reserved.length === 3 &&
        node.reserved.every((value) => Number.isInteger(value) && value >= 0 && value <= 255)))
  );
}
