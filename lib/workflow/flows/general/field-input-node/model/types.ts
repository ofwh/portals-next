import type { WorkflowDataTypes } from '@/lib/types/workflow';

export type OutputFormat = 'String' | 'Object';

export interface FieldInputConfig {
  text: string;
  outputFormat: OutputFormat;
}

export type FieldInputOutput = WorkflowDataTypes['String' | 'Object'];
