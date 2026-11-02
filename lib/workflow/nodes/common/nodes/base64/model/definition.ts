import { nodeLabel } from '@/lib/workflow/nodes/utils';
import type { Base64Config } from './types';

export const definition = { type: 'common.base64', ...nodeLabel('workflowNodes.common.base64.name'), version: 1 };
export const defaultConfig: Base64Config = { mode: 'encode' };
