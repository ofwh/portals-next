import { handle } from '@/lib/api/server';
import service from '@/lib/services/preferences';
import { getPreferenceCookies, writePreferenceCookies } from '@/lib/services/preferences/server';

export async function POST(request: Request) {
  return handle(request, async (params) => {
    const preferences = service.get(params, await getPreferenceCookies());

    await writePreferenceCookies(preferences, new URL(request.url).protocol === 'https:');

    return preferences;
  });
}
