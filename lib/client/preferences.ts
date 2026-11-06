import type { BaseResponse } from '@/lib/api';
import type { Preferences } from '@/lib/types/preferences';

async function request(
  action: 'detail' | 'update',
  input: Partial<Preferences>,
  signal?: AbortSignal,
): Promise<Preferences> {
  const response = await fetch(`/api/preferences/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    cache: 'no-store',
    signal,
  });

  if (!response.ok) {
    throw new Error();
  }

  const result: BaseResponse<Preferences> = await response.json();

  if (result.code !== 0 || result.data === null) {
    throw new Error(result.message);
  }

  return result.data;
}

export function getPreferences(signal?: AbortSignal): Promise<Preferences> {
  return request('detail', {}, signal);
}

export function updatePreferences(input: Partial<Preferences>): Promise<Preferences> {
  return request('update', input);
}
