import 'server-only';
import { appError } from './index';

export interface EventStreamContext<T> {
  signal: AbortSignal;
  emit(event: T): void;
}
export interface EventStreamHandle {
  done: Promise<void>;
  cancel(): void;
  headers?: HeadersInit;
}

export function eventStream<T extends { type: string }>(
  requestSignal: AbortSignal,
  start: (context: EventStreamContext<T>) => EventStreamHandle,
): Response {
  const abort = new AbortController();
  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController<Uint8Array>;
  let closed = false;
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  const cleanup = () => {
    if (heartbeat !== undefined) {
      clearInterval(heartbeat);
    }

    requestSignal.removeEventListener('abort', disconnect);
  };
  const close = () => {
    if (closed) {
      return;
    }

    closed = true;
    cleanup();
    controller.close();
  };
  const disconnect = () => {
    abort.abort();
    close();
  };
  const stream = new ReadableStream<Uint8Array>(
    {
      start(value) {
        controller = value;
      },
      cancel() {
        closed = true;
        cleanup();
        abort.abort();
      },
    },
    { highWaterMark: 1024 * 1024, size: (chunk) => chunk.byteLength },
  );
  const write = (value: string) => {
    if (closed) {
      return;
    }

    const chunk = encoder.encode(value);

    if ((controller.desiredSize ?? 0) < chunk.byteLength) {
      disconnect();

      return;
    }

    controller.enqueue(chunk);
  };

  requestSignal.addEventListener('abort', disconnect, { once: true });
  if (requestSignal.aborted) {
    disconnect();
  }

  try {
    const handle = start({
      signal: abort.signal,
      emit: (event) => write(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`),
    });

    abort.signal.addEventListener('abort', handle.cancel, { once: true });
    if (abort.signal.aborted) {
      handle.cancel();
    }

    if (!closed) {
      heartbeat = setInterval(() => write(': heartbeat\n\n'), 15000);
    }

    void handle.done
      .then(close, () => {
        abort.abort();
        if (!closed) {
          closed = true;
          cleanup();
          controller.error(appError('common.INTERNAL_ERROR'));
        }
      })
      .finally(() => abort.signal.removeEventListener('abort', handle.cancel));
    const headers = new Headers(handle.headers);

    headers.set('Content-Type', 'text/event-stream; charset=utf-8');
    headers.set('Cache-Control', 'no-cache, no-transform');
    headers.set('X-Accel-Buffering', 'no');
    headers.set('Vary', 'Accept-Language');

    return new Response(stream, { headers });
  } catch (error) {
    disconnect();

    throw error;
  }
}
