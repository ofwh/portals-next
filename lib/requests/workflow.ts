import { appError } from '@/lib/api';
import type { WorkflowNodeCatalog } from '@/lib/types/workflow';
import type { RunEvent } from '@/lib/workflow/model';
import { parseRunEvent } from '@/lib/workflow/model/events';
import { isRecord } from '@/lib/workflow/utils';
import { request } from './request';

export function listWorkflowNodes(signal?: AbortSignal): Promise<WorkflowNodeCatalog> {
  return request('/api/workflow/list', {}, signal);
}

export function saveWorkflowDraft(id: string, flow: string, signal?: AbortSignal): Promise<{ id: string }> {
  return request('/api/workflow/draft', { id, flow }, signal);
}

export async function runWorkflow(
  id: string,
  runId: string,
  onEvent: (event: RunEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  const response = await fetch('/api/workflow/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({ id, runId }),
    signal,
  });

  if (!response.ok) {
    throw appError('common.INTERNAL_ERROR');
  }

  if (!response.headers.get('Content-Type')?.startsWith('text/event-stream')) {
    const result: unknown = await response.json();

    throw new Error(isRecord(result) && typeof result.message === 'string' ? result.message : '');
  }

  if (!response.body) {
    throw appError('common.INTERNAL_ERROR');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let terminal = false;
  const dispatch = (frame: string) => {
    const data = frame
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).replace(/^ /, ''))
      .join('\n');

    if (!data || terminal) {
      return;
    }

    const value: unknown = JSON.parse(data);
    const event = parseRunEvent(value);

    if (event.runId !== runId) {
      return;
    }

    terminal = event.type === 'run.completed' || event.type === 'run.failed' || event.type === 'run.cancelled';
    onEvent(event);
  };

  try {
    while (true) {
      const { value, done } = await reader.read();

      buffer += decoder.decode(value, { stream: !done });
      buffer = buffer.replace(/\r\n/g, '\n');
      let boundary = buffer.indexOf('\n\n');

      while (boundary !== -1) {
        dispatch(buffer.slice(0, boundary));
        buffer = buffer.slice(boundary + 2);
        boundary = buffer.indexOf('\n\n');
      }

      if (done) {
        if (!terminal) {
          throw appError('common.INTERNAL_ERROR');
        }

        return;
      }
    }
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
