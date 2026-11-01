import type { FilterConfig } from './types';
import { nodeLabel } from '../../../utils';
import type { SubscriptionProtocol } from '../../types';

export const definition = {
  type: 'subscription.filter',
  ...nodeLabel('workflowNodes.subscription.filter.name'),
  version: 1,
};
export const defaultConfig: FilterConfig = { protocols: [], namePattern: [], exclude: false };

export const protocolOptions = {
  ss: 'Shadowsocks',
  vmess: 'VMess',
  vless: 'VLESS',
  trojan: 'Trojan',
  hysteria: 'Hysteria',
  hysteria2: 'Hysteria2',
  anytls: 'AnyTLS',
} satisfies Record<SubscriptionProtocol, string>;
