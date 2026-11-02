import type { WorkflowDataTypes } from '@/lib/workflow/nodes/types';

export type MergeConfig = Record<string, never>;
export type MergeInput = WorkflowDataTypes['any'];
export type MergeOutput = WorkflowDataTypes['Array'];
export type MergeRunInput = readonly MergeInput[];
