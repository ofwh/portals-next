export * from './canvas';
export * from './snapshot';
export * from './storage';
export * from './validation';

export interface NodeInstance<C = unknown> {
  id: string;
  type: string;
  name: string;
  config: C;
  definitionVersion: number;
}
export interface FlowEdge {
  id: string;
  source: string;
  target: string;
}
export interface WorkflowDefinition {
  id: string;
  version: number;
  nodes: NodeInstance[];
  edges: FlowEdge[];
}
export interface CanvasNode extends NodeInstance {
  position: { x: number; y: number };
}
export interface FlowSnapshot {
  schemaVersion: number;
  workflowId: string;
  nodes: CanvasNode[];
  edges: FlowEdge[];
  viewport?: { x: number; y: number; zoom: number };
}
export type NodeStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled' | 'skipped';
export interface NodeRunState {
  runId: string;
  nodeId: string;
  status: NodeStatus;
  input?: readonly unknown[];
  output?: unknown;
  error?: { code: string; message: string };
  startedAt?: number;
  finishedAt?: number;
}
export interface ExecutionPlan {
  nodes: NodeInstance[];
  order: string[];
  incoming: Record<string, string[]>;
}
export interface RunRequest {
  runId: string;
  workflow: WorkflowDefinition;
}
export type RunEvent =
  | { type: 'run.started'; runId: string }
  | { type: 'node.updated'; runId: string; node: NodeRunState }
  | { type: 'run.completed'; runId: string; outputs: Record<string, unknown> }
  | { type: 'run.failed' | 'run.cancelled'; runId: string; message: string };
