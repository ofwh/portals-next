import type { WorkflowDataTypes } from '@/lib/workflow/nodes/types';

export type OutputFormat = 'String' | 'Object';

export interface FieldInputConfig {
  text: string;
  outputFormat: OutputFormat;
}

export type FieldInputOutput = WorkflowDataTypes['String' | 'Object'];
