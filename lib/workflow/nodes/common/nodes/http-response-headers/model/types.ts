import type { WorkflowObject } from '@/lib/workflow/nodes/types';
import type { HttpHeader } from '../../../types/http';

export interface HttpResponseHeadersConfig {
  method: 'GET' | 'POST';
  url: string;
  headers: (HttpHeader & { id: string })[];
  body: string;
}

export type HttpResponseHeadersOutput = WorkflowObject<string>;
