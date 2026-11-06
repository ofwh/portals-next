'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { ShortcutType } from '@/lib/types/shortcuts';
import { useShortcuts } from './use-shortcuts';

function subscribeOrigin() {
  return () => undefined;
}

function getOrigin() {
  return window.location.origin;
}

function getServerOrigin() {
  return '';
}

export function useRouteUrl(type: ShortcutType) {
  const { prefixes } = useShortcuts();
  const origin = useSyncExternalStore(subscribeOrigin, getOrigin, getServerOrigin);
  const prefix = prefixes[type].pathname;

  return useCallback(
    (pathname: string) => `${origin}${prefix.replace(/\/+$/, '')}/${pathname.replace(/^\/+/, '')}`,
    [origin, prefix],
  );
}
