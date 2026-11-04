import type { BaseResponse } from '@/lib/api';
import type { Pagination } from '@/lib/types/pagination';
import type { TagDetail, TagListParams, TagOption, TagUpdateInput } from '@/lib/types/tag';

export async function listTagOptions(group: string, signal: AbortSignal): Promise<TagOption[]> {
  const options: TagOption[] = [];
  let page = 1;

  while (true) {
    const response = await fetch('/api/tags/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ group, page, size: 100 }),
      signal,
    });

    if (!response.ok) {
      throw new Error();
    }

    const result: BaseResponse<Pagination<TagOption>> = await response.json();

    if (result.code !== 0 || result.data === null) {
      throw new Error(result.message);
    }

    options.push(...result.data.data);

    if (options.length >= result.data.total || result.data.data.length === 0) {
      return [...new Map(options.map((option) => [option.id, option])).values()];
    }

    page += 1;
  }
}

async function requestTag<Result>(
  action: string,
  input: TagListParams | TagUpdateInput | { id: string },
  signal?: AbortSignal,
): Promise<Result> {
  const response = await fetch(`/api/tags/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal,
  });

  if (!response.ok) {
    throw new Error();
  }

  const result: BaseResponse<Result> = await response.json();

  if (result.code !== 0 || result.data === null) {
    throw new Error(result.message);
  }

  return result.data;
}

export function listTags(params: TagListParams, signal: AbortSignal): Promise<Pagination<TagDetail>> {
  return requestTag('list', params, signal);
}

export function getTag(id: string, signal: AbortSignal): Promise<TagDetail> {
  return requestTag('detail', { id }, signal);
}

export function updateTag(input: TagUpdateInput): Promise<TagDetail> {
  return requestTag('update', input);
}

export function removeTag(id: string): Promise<{ id: string }> {
  return requestTag('remove', { id });
}
