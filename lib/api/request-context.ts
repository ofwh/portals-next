import { AsyncLocalStorage } from 'node:async_hooks';
import 'server-only';
import { v6 as uuidv6 } from 'uuid';
import { REQUEST_ID_HEADER } from '@/lib/shared/http';

interface RequestContext {
  requestId: string;
}

const globalForRequests = globalThis as typeof globalThis & {
  portalsRequestContext?: AsyncLocalStorage<RequestContext>;
};
const storage = (globalForRequests.portalsRequestContext ??= new AsyncLocalStorage<RequestContext>());

export function getRequestId(): string | undefined {
  return storage.getStore()?.requestId;
}

export function withRequestId(headers?: HeadersInit): Headers {
  const result = new Headers(headers);
  const requestId = getRequestId();

  if (requestId) {
    result.set(REQUEST_ID_HEADER, requestId);
  }

  return result;
}

export function withRequestContext(request: Request, action: () => Response | Promise<Response>): Promise<Response> {
  const requestId = request.headers.get(REQUEST_ID_HEADER)?.trim() || getRequestId() || uuidv6();

  return storage.run({ requestId }, async () => {
    const response = await action();

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: withRequestId(response.headers),
    });
  });
}
