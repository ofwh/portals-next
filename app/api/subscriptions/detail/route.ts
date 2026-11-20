import { handle } from '@/lib/api/server';
import service from '@/lib/services/subscriptions';

export async function POST(request: Request) {
  return handle(request, service.detail);
}
