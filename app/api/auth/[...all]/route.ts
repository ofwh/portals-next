import { toNextJsHandler } from 'better-auth/next-js';
import { withRequestContext } from '@/lib/api/request-context';
import { auth } from '@/lib/auth';

const handlers = toNextJsHandler(auth);

export async function GET(request: Request): Promise<Response> {
  return withRequestContext(request, () => handlers.GET(request));
}

export async function POST(request: Request): Promise<Response> {
  return withRequestContext(request, () => handlers.POST(request));
}
