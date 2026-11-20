import { nodeLabel } from '@/lib/workflow/node/utils';
import type { HttpRequestConfig } from './types';

export const definition = {
  type: 'common.httpRequest',
  ...nodeLabel('workflowNodes.common.httpRequest.name'),
  version: 1,
};
export const defaultConfig: HttpRequestConfig = { method: 'GET', url: '', headers: [], body: '' };
