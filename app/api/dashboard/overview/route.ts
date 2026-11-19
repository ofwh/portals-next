import { handle } from '@/lib/api/server';
import service from '@/lib/services/dashboard';

export async function POST(request: Request) {
  return handle(request, service.overview);
}
