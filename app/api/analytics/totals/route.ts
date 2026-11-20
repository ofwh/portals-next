import { handle } from '@/lib/api/server';
import service from '@/lib/services/analytics';

export async function POST(request: Request) {
  return handle(request, service.totals);
}
