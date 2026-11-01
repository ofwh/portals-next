import type { ShortcutInput, ShortcutType } from '@/lib/types/shortcuts';

export const DEFAULT_SHORTCUTS = {
  proxy: { pathname: '/p', status: true },
  redirect: { pathname: '/r', status: true },
  cache: { pathname: '/c', status: true },
  original: { pathname: '/o', status: true },
} as const satisfies Record<ShortcutType, Pick<ShortcutInput, 'pathname' | 'status'>>;
