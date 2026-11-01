import { createStore } from 'zustand/vanilla';
import { listShortcuts, updateShortcut } from '@/lib/requests/shortcuts';
import type { Shortcut, ShortcutInput, ShortcutType } from '@/lib/types/shortcuts';

interface ShortcutsState {
  items: Partial<Record<ShortcutType, Shortcut>>;
  loading: boolean;
  loaded: boolean;
  saving: boolean;
  error: string | null;
  load: (signal: AbortSignal) => Promise<void>;
  save: (input: ShortcutInput[]) => Promise<void>;
}

export function createShortcutsStore() {
  return createStore<ShortcutsState>()((set, get) => ({
    items: {},
    loading: true,
    loaded: false,
    saving: false,
    error: null,
    async load(signal) {
      set({ loading: true, error: null });

      try {
        const result = await listShortcuts(signal);

        if (!signal.aborted) {
          set({ items: Object.fromEntries(result.data.map((item) => [item.type, item])), loaded: true });
        }
      } catch (reason) {
        if (!signal.aborted) {
          set({ error: reason instanceof Error ? reason.message : '' });
        }
      } finally {
        if (!signal.aborted) {
          set({ loading: false });
        }
      }
    },
    async save(input) {
      if (!get().loaded || get().loading || get().saving || get().error !== null) {
        throw new Error();
      }

      set({ saving: true });

      try {
        for (const values of input) {
          const item = await updateShortcut(values);

          set((state) => ({ items: { ...state.items, [item.type]: item } }));
        }
      } finally {
        set({ saving: false });
      }
    },
  }));
}
