import type { SubscriptionTemplate, SubscriptionTemplateFormat } from '@/lib/subconverter/types/template';
import type { WorkflowDataTypes } from '@/lib/types/workflow';

export interface ParseTemplateConfig {
  format: SubscriptionTemplateFormat;
}
export type ParseTemplateInput = WorkflowDataTypes['String'];
export type ParseTemplateOutput = SubscriptionTemplate;
