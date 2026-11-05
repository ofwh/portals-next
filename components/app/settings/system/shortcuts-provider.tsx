'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { ShortcutsContext } from '@/hooks/use-shortcuts';
import type { ApplicationConfig } from '@/lib/types/route';
import { createShortcutsStore } from '@/stores/shortcuts';

export function ShortcutsProvider({
  initialShortcuts,
  children,
}: {
  initialShortcuts: ApplicationConfig['shortcuts'];
  children: ReactNode;
}) {
  const [store] = useState(() => createShortcutsStore(initialShortcuts));

  return <ShortcutsContext.Provider value={store}>{children}</ShortcutsContext.Provider>;
}
