import { nodeLabel } from '@/lib/workflow/node/utils';
import type { ProxyListConfig } from './types';

export const definition = {
  type: 'proxy.proxyList',
  ...nodeLabel('workflowNodes.proxy.proxyList.name'),
  version: 1,
};
export const defaultConfig: ProxyListConfig = {};
