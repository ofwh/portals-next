'use client';

import { createContext, useContext } from 'react';
import { useStore } from 'zustand';
import type { createShortcutsStore } from '@/stores/shortcuts';

export const ShortcutsContext = createContext<ReturnType<typeof createShortcutsStore> | null>(null);

export function useShortcuts() {
  const store = useContext(ShortcutsContext);

  if (!store) {
    throw new Error('ShortcutsProvider is required');
  }

  return useStore(store);
}
