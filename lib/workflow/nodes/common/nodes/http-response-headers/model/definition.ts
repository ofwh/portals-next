import { nodeLabel } from '@/lib/workflow/nodes/utils';
import type { HttpResponseHeadersConfig } from './types';

export const definition = {
  type: 'common.httpResponseHeaders',
  ...nodeLabel('workflowNodes.common.httpResponseHeaders.name'),
  version: 1,
};
export const defaultConfig: HttpResponseHeadersConfig = { method: 'GET', url: '', headers: [], body: '' };
