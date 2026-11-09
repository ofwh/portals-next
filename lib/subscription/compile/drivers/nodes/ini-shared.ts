import type { ProxyNode } from '../../../types/proxy-node';

export function safe(value: string | undefined, quoted = false): boolean {
  return !/[\r\n\x00-\x1f\x7f]/.test(value ?? '') && !(quoted ? /"/ : /,/).test(value ?? '');
}

export function commonSafe(node: ProxyNode): boolean {
  return (
    !!node.server &&
    node.port > 0 &&
    node.port <= 65535 &&
    safe(node.server) &&
    safe(node.name.replace(/^"|"$/g, ''), true)
  );
}

export function plainXray(node: ProxyNode): boolean {
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
