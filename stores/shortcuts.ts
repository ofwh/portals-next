import { createStore } from 'zustand/vanilla';
import { listShortcuts, updateShortcut } from '@/lib/client/shortcuts';
import { DEFAULT_SHORTCUTS } from '@/lib/constants/shortcuts';
import type { ApplicationConfig } from '@/lib/types/route';
import type { Shortcut, ShortcutInput, ShortcutType } from '@/lib/types/shortcuts';

interface ShortcutsState {
  prefixes: ApplicationConfig['shortcuts'];
  items: Partial<Record<ShortcutType, Shortcut>>;
  loading: boolean;
  loaded: boolean;
  saving: boolean;
  error: string | null;
  load: (signal: AbortSignal) => Promise<void>;
  save: (input: ShortcutInput[]) => Promise<void>;
}

export function createShortcutsStore(initialShortcuts: ApplicationConfig['shortcuts'] = DEFAULT_SHORTCUTS) {
  return createStore<ShortcutsState>()((set, get) => ({
    items: {},
    prefixes: initialShortcuts,
    loading: true,
    loaded: false,
    saving: false,
    error: null,
    async load(signal) {
      set({ loading: true, error: null });

      try {
        const result = await listShortcuts(signal);

        if (!signal.aborted) {
          const prefixes = result.data.reduce<ApplicationConfig['shortcuts']>(
            (current, item) => ({ ...current, [item.type]: { pathname: item.pathname, status: item.status } }),
            DEFAULT_SHORTCUTS,
          );

          set({ items: Object.fromEntries(result.data.map((item) => [item.type, item])), prefixes, loaded: true });
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

          set((state) => ({
            items: { ...state.items, [item.type]: item },
            prefixes: { ...state.prefixes, [item.type]: { pathname: item.pathname, status: item.status } },
          }));
        }
      } finally {
        set({ saving: false });
      }
    },
  }));
}
