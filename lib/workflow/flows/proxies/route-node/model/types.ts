import type { RouteMode } from '@/lib/constants/routes';
import type { WorkflowDataTypes } from '@/lib/types/workflow';

export interface RouteConfig {
  mode: RouteMode;
  pathname: string;
  method: 'GET' | 'POST';
  body: string;
  token: string;
}

export type RouteOutput = WorkflowDataTypes['String'];
