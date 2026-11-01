import type { shortcuts } from '@/lib/db/schema';

type ShortcutRow = typeof shortcuts.$inferSelect;

export type ShortcutType = ShortcutRow['type'];
export type Shortcut = Omit<ShortcutRow, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};
export type ShortcutInput = Pick<Shortcut, 'type' | 'pathname' | 'status'> & { id?: string };
