import type { HttpHeader } from '@/lib/shared/http';
import type { WorkflowObject } from '@/lib/types/workflow';

export interface HttpResponseHeadersConfig {
  method: 'GET' | 'POST';
  url: string;
  headers: (HttpHeader & { id: string })[];
  body: string;
}

export type HttpResponseHeadersOutput = WorkflowObject<string>;
