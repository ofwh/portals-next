import type { NodeRunState, RunEvent } from '../model';

export interface ClientRunState {
  runId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  nodes: Record<string, NodeRunState>;
  outputs?: Record<string, unknown>;
  message?: string;
}

export function applyRunEvent(state: ClientRunState, event: RunEvent): ClientRunState {
  if (state.runId !== event.runId || (event.type === 'node.updated' && event.node.runId !== state.runId)) {
    return state;
  }

  if (state.status === 'completed' || state.status === 'failed' || state.status === 'cancelled') {
    return state;
  }

  switch (event.type) {
    case 'run.started':
      return { runId: state.runId, status: 'running', nodes: {} };
    case 'node.updated':
      return { ...state, nodes: { ...state.nodes, [event.node.nodeId]: event.node } };
    case 'run.completed':
      return { ...state, status: 'completed', outputs: event.outputs };
    case 'run.failed':
      return { ...state, status: 'failed', message: event.message };
    case 'run.cancelled':
      return { ...state, status: 'cancelled', message: event.message };
  }
}
