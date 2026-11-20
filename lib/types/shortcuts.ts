import type { SHORTCUT_ROUTES } from '@/lib/constants/shortcuts';
import type { shortcuts } from '@/lib/db/schema';

type ShortcutRow = typeof shortcuts.$inferSelect;

export type ShortcutType = keyof typeof SHORTCUT_ROUTES;
export type Shortcut = Omit<ShortcutRow, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};
export type ShortcutInput = Pick<Shortcut, 'type' | 'pathname' | 'status'> & { id?: string };
