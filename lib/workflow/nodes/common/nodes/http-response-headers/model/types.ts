import type { HttpHeader } from '@/lib/shared/http';
import type { WorkflowObject } from '@/lib/workflow/nodes/types';

export interface HttpResponseHeadersConfig {
  method: 'GET' | 'POST';
  url: string;
  headers: (HttpHeader & { id: string })[];
  body: string;
}

export type HttpResponseHeadersOutput = WorkflowObject<string>;
