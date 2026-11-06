import { handle } from '@/lib/api/server';
import service from '@/lib/services/routes';

export async function POST(request: Request) {
  return handle(request, service.list);
}
