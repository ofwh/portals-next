import { appError } from '@/lib/api';
import { isRecord } from '@/lib/shared/data';
import type { NodeStatus, RunEvent } from './index';

function isStatus(value: unknown): value is NodeStatus {
  return (
    value === 'pending' ||
    value === 'running' ||
    value === 'success' ||
    value === 'failed' ||
    value === 'cancelled' ||
    value === 'skipped'
  );
}

export function parseRunEvent(value: unknown): RunEvent {
  if (!isRecord(value) || typeof value.runId !== 'string') {
    throw appError('common.INVALID_PARAMS');
  }

  const runId = value.runId;

  switch (value.type) {
    case 'run.started':
      return { type: value.type, runId };
    case 'run.completed':
      if (isRecord(value.outputs)) {
        return { type: value.type, runId, outputs: value.outputs };
      }

      break;
    case 'run.failed':
    case 'run.cancelled':
      if (typeof value.message === 'string') {
        return { type: value.type, runId, message: value.message };
      }

      break;
    case 'node.updated': {
      const node = value.node;

      if (
        !isRecord(node) ||
        node.runId !== runId ||
        typeof node.nodeId !== 'string' ||
        !isStatus(node.status) ||
        (node.input !== undefined && !Array.isArray(node.input)) ||
        (node.startedAt !== undefined && typeof node.startedAt !== 'number') ||
        (node.finishedAt !== undefined && typeof node.finishedAt !== 'number') ||
        (node.error !== undefined &&
          (!isRecord(node.error) || typeof node.error.code !== 'number' || typeof node.error.message !== 'string'))
      ) {
        break;
      }

      const inputNodes =
        node.inputNodes === undefined
          ? undefined
          : Array.isArray(node.inputNodes)
            ? node.inputNodes.map((source: unknown) => {
                if (!isRecord(source) || typeof source.nodeId !== 'string' || typeof source.name !== 'string') {
                  throw appError('common.INVALID_PARAMS');
                }

                return { nodeId: source.nodeId, name: source.name };
              })
            : null;

      if (inputNodes === null || (inputNodes && inputNodes.length !== node.input?.length)) {
        break;
      }

      return {
        type: value.type,
        runId,
        node: {
          runId,
          nodeId: node.nodeId,
          status: node.status,
          ...(typeof node.startedAt === 'number' ? { startedAt: node.startedAt } : {}),
          ...(typeof node.finishedAt === 'number' ? { finishedAt: node.finishedAt } : {}),
          ...(Array.isArray(node.input) ? { input: node.input } : {}),
          ...(inputNodes ? { inputNodes } : {}),
          ...(Object.hasOwn(node, 'output') ? { output: node.output } : {}),
          ...(isRecord(node.error) && typeof node.error.code === 'number' && typeof node.error.message === 'string'
            ? { error: { code: node.error.code, message: node.error.message } }
            : {}),
        },
      };
    }
  }

  throw appError('common.INVALID_PARAMS');
}
