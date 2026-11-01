import type { Base64Config } from './types';
import { nodeLabel } from '../../../utils';

export const definition = { type: 'common.base64', ...nodeLabel('workflowNodes.common.base64.name'), version: 1 };
export const defaultConfig: Base64Config = { mode: 'encode' };
