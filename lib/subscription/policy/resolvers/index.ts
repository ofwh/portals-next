import { fallbackResolver } from './fallback';
import { loadBalanceResolver } from './load-balance';
import { relayResolver } from './relay';
import { selectResolver } from './select';
import { smartResolver } from './smart';
import { ssidResolver } from './ssid';
import type { GroupCategoryResolver } from './types';
import { urlTestResolver } from './url-test';
import type { ProxyGroupKind } from '../../types/policy';

export const groupCategoryResolvers: Record<ProxyGroupKind, GroupCategoryResolver> = {
  select: selectResolver,
  'url-test': urlTestResolver,
  fallback: fallbackResolver,
  'load-balance': loadBalanceResolver,
  relay: relayResolver,
  ssid: ssidResolver,
  smart: smartResolver,
};

export {
  selectResolver,
  urlTestResolver,
  fallbackResolver,
  loadBalanceResolver,
  relayResolver,
  ssidResolver,
  smartResolver,
};
