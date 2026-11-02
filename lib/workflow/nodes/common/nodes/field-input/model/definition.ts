import { nodeLabel } from '@/lib/workflow/nodes/utils';
import type { FieldInputConfig } from './types';

export const definition = {
  type: 'common.fieldInput',
  ...nodeLabel('workflowNodes.common.fieldInput.name'),
  version: 1,
};
export const defaultConfig: FieldInputConfig = { text: '', outputFormat: 'String' };
