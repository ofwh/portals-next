import { handle } from '@/lib/api/server';
import service from '@/lib/services/shortcuts';

export async function POST(request: Request) {
  return handle(request, service.list);
}
