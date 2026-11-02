import type { WorkflowDataTypes } from '@/lib/workflow/nodes/types';
import type { HttpHeader } from '../../../types/http';

export interface HttpRequestConfig {
  method: 'GET' | 'POST';
  url: string;
  headers: (HttpHeader & { id: string })[];
  body: string;
}

export type HttpRequestOutput = WorkflowDataTypes['String'];
