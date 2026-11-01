import { handle } from '@/lib/api/server';
import { getPreferenceCookies, writePreferenceCookies } from '@/lib/preferences/server';
import service from '@/lib/services/preferences';

export async function POST(request: Request) {
  return handle(request, async (params) => {
    const preferences = service.get(params, await getPreferenceCookies());

    await writePreferenceCookies(preferences, new URL(request.url).protocol === 'https:');

    return preferences;
  });
}
