import { configFormatOptions } from '@/lib/subscription/shared/config';
import { nodeLabel } from '@/lib/workflow/node/utils';
import type { RulesetResolveConfig } from './types';

export const definition = {
  type: 'ruleset.resolve',
  ...nodeLabel('workflowNodes.configuration.ruleset.name'),
  version: 1,
};
export const defaultConfig: RulesetResolveConfig = { format: '', transformer: '' };
export const formatOptions = configFormatOptions;
