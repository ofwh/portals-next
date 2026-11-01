import type { MergeConfig } from './types';
import { nodeLabel } from '../../utils';

export const definition = { type: 'common.merge', ...nodeLabel('commonNodes.merge.name'), version: 1 };
export const defaultConfig: MergeConfig = {};
