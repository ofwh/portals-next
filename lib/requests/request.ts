import type { BaseResponse } from '@/lib/api';

export async function request<T>(url: string, input: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal,
  });

  if (!response.ok) {
    throw new Error();
  }

  const result: BaseResponse<T> = await response.json();

  if (result.code !== 0 || result.data === null) {
    throw new Error(result.message);
  }

  return result.data;
}
