import type { ProxyNodeFields } from '../proxy-node';

export type ProxyType = ProxyNodeFields['type'];

export interface NodeFieldsBase {
  name: string;
  id?: string;
  sourceId?: string;
  groupId?: string;
  group?: string;
}

export type SupportedNodeFields<T extends ProxyType> = Extract<ProxyNodeFields, { type: T }>;

export type { WireGuardNodeFieldsWireGuardPeersItem as WireGuardPeer } from '../protocols/wireguard';
