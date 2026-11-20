import { ROUTE_TYPE } from '@/lib/constants/routes';
import { nodeLabel } from '@/lib/workflow/node/utils';
import type { RouteConfig } from './types';

export const definition = {
  type: 'common.route',
  ...nodeLabel('workflowNodes.proxy.route.name'),
  version: 1,
};

export const defaultConfig: RouteConfig = { mode: ROUTE_TYPE.PROXY, pathname: '', method: 'GET', body: '', token: '' };
