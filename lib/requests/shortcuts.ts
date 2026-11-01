import type { Pagination } from '@/lib/types/pagination';
import type { Shortcut, ShortcutInput } from '@/lib/types/shortcuts';
import { request } from './request';

export function listShortcuts(signal?: AbortSignal): Promise<Pagination<Shortcut>> {
  return request('/api/shortcuts/list', { page: 1, size: 4 }, signal);
}

export function updateShortcut(input: ShortcutInput): Promise<Shortcut> {
  return request('/api/shortcuts/update', input);
}
