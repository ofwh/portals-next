'use client';

import { useState } from 'react';
import { useStore } from 'zustand';
import { createShortcutsStore } from '@/stores/shortcuts';

export function useShortcuts() {
  const [store] = useState(createShortcutsStore);

  return useStore(store);
}
