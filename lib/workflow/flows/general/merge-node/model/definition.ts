import { nodeLabel } from '@/lib/workflow/node/utils';
import type { MergeConfig } from './types';

export const definition = { type: 'common.merge', ...nodeLabel('workflowNodes.common.merge.name'), version: 1 };
export const defaultConfig: MergeConfig = {};
