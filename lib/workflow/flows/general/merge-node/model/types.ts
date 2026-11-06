import type { WorkflowDataTypes } from '@/lib/types/workflow';

export type MergeConfig = Record<string, never>;
export type MergeInput = WorkflowDataTypes['any'];
export type MergeOutput = WorkflowDataTypes['Array'];
export type MergeRunInput = readonly MergeInput[];
