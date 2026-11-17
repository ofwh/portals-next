import { ipVersion } from '@chainsafe/is-ip';
import { atom, text } from './config';
import { computed, field } from './field';
import type { NodeDefinition, NodeSchema, NodeSerialization, NodeSource, Source } from '../types';

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

export function ruleValue(value: unknown): string {
  const result = text(value);

  return result.startsWith('(') ? result : atom(value);
}

export function serialize(value: Source, definition: NodeDefinition, separator = ', '): NodeSerialization {
  const positional = definition.positional ?? [];
  const excluded = new Set(['name', 'type', 'server', 'port', 'section', ...positional]);
  const parts = [String(value.type)];

  if (definition.endpoint !== false) {
    parts.push(String(value.server), String(value.port));
  }

  parts.push(...positional.filter((key) => Object.hasOwn(value, key)).map((key) => String(value[key])));
  parts.push(
    ...Object.entries(value)
      .filter(([key]) => !excluded.has(key))
      .map(([key, entry]) => `${key}=${String(entry)}`),
  );
  const name = String(value.name);
  const label = name.includes(',') && !name.startsWith('"') ? `"${name}"` : name;

  return { content: `${label} = ${parts.join(separator)}`, sections: [] };
}

export function safe(value: string | undefined, quoted = false): boolean {
  return !/[\r\n\x00-\x1f\x7f]/.test(value ?? '') && !(quoted ? /"/ : /,/).test(value ?? '');
}

export function commonSafe(node: Readonly<NodeSource>): boolean {
  return (
    !!node.server &&
    Number.isInteger(node.port) &&
    node.port > 0 &&
    node.port <= 65535 &&
    safe(node.server) &&
    !/[\r\n[\]]/.test(node.sectionName) &&
    safe(node.name.replace(/^"|"$/g, ''), true) &&
    [node.username, node.serverName, node.host, node.encryption, node.certificatePin, node.fingerprint].every((value) =>
      safe(value),
    ) &&
    (node.alpn ?? []).every((value) => safe(value, true))
  );
}

export function wireguardSafe(node: Readonly<NodeSource>): boolean {
  return [node.privateKey, node.publicKey, node.preSharedKey, node.testUrl, ...(node.dns ?? [])].every(
    (value) => safe(value) && !/["()]/.test(value ?? ''),
  );
}
