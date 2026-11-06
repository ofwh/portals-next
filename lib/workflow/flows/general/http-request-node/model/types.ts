import type { HttpHeader } from '@/lib/shared/http';
import type { WorkflowDataTypes } from '@/lib/types/workflow';

export interface HttpRequestConfig {
  method: 'GET' | 'POST';
  url: string;
  headers: (HttpHeader & { id: string })[];
  body: string;
}

export type HttpRequestOutput = WorkflowDataTypes['String'];
