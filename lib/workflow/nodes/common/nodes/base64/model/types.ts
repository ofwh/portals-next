import type { WorkflowDataTypes } from '@/lib/workflow/nodes/types';

export type Base64Mode = 'encode' | 'decode';

export interface Base64Config {
  mode: Base64Mode;
}

export type Base64Input = WorkflowDataTypes['String'];
export type Base64Output = WorkflowDataTypes['String'];
