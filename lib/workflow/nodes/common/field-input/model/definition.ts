import type { FieldInputConfig } from './types';
import { nodeLabel } from '../../../utils';

export const definition = {
  type: 'common.fieldInput',
  ...nodeLabel('workflowNodes.common.fieldInput.name'),
  version: 1,
};
export const defaultConfig: FieldInputConfig = { text: '', outputFormat: 'TEXT' };
