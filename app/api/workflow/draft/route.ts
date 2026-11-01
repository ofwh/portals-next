import { handle } from '@/lib/api/server';
import service from '@/lib/services/workflow';

export async function POST(request: Request) {
  return handle(request, service.draft);
}
