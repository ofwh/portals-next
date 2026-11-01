'use client';

import { useLocale } from 'next-intl';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useStore } from 'zustand';
import { PreferencesContext, usePreferences } from '@/hooks/use-preferences';
import type { Preferences } from '@/lib/types/preferences';
import { createPreferencesStore } from '@/stores/preferences';

export function PreferencesProvider({
  initialPreferences,
  children,
}: {
  initialPreferences: Preferences;
  children: ReactNode;
}) {
  const [store] = useState(() => createPreferencesStore(initialPreferences));
  const preferences = useStore(store, (state) => state.preferences);
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = preferences.theme === 'dark' || (preferences.theme === 'system' && media.matches);

      document.documentElement.classList.toggle('dark', dark);
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    };

    apply();
    media.addEventListener('change', apply);

    return () => media.removeEventListener('change', apply);
  }, [preferences.theme]);

  return (
    <PreferencesContext.Provider value={store}>
      <PreferencesSync initialPreferences={initialPreferences} />
      {children}
    </PreferencesContext.Provider>
  );
}

function PreferencesSync({ initialPreferences }: { initialPreferences: Preferences }) {
  const { hydrate, reload, sessionStatus } = usePreferences();

  useEffect(() => {
    hydrate(initialPreferences);
  }, [initialPreferences, hydrate]);

  useEffect(() => {
    if (sessionStatus === 'authenticated' || sessionStatus === 'guest') {
      void reload();
    }
  }, [initialPreferences, reload, sessionStatus]);

  return null;
}
