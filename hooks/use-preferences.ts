'use client';

import { useTranslations } from 'next-intl';
import { createContext, useCallback, useContext } from 'react';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { authClient } from '@/lib/auth-client';
import { formatDateTime as formatDateTimeValue } from '@/lib/date-time';
import { preferenceCookieOptions, preferenceKeys, resolvePreferences } from '@/lib/preferences';
import type { Preferences } from '@/lib/types/preferences';
import type { PreferencesState, PreferencesStore } from '@/stores/preferences';
import { useCookie } from './use-cookie';

export const PreferencesContext = createContext<PreferencesStore | null>(null);

export type PreferencesValue = PreferencesState & {
  sessionStatus: 'pending' | 'authenticated' | 'guest' | 'error';
  formatDateTime: (value: Parameters<typeof formatDateTimeValue>[0]) => string;
};

export function usePreferences(): PreferencesValue;
export function usePreferences<Value>(selector: (state: PreferencesValue) => Value): Value;

export function usePreferences(selector: (state: PreferencesValue) => unknown = (state) => state) {
  const store = useContext(PreferencesContext);

  if (!store) {
    throw new Error('PreferencesProvider is required');
  }

  const { data: session, isPending, error: sessionError } = authClient.useSession();
  const { get, set } = useCookie();
  const t = useTranslations('admin.settings.system.preferences');
  const timeFormat = useStore(store, (state) => state.preferences.timeFormat);
  const readLocal = useCallback(
    () =>
      resolvePreferences(
        {},
        {
          theme: get('theme'),
          language: get('language'),
          timeFormat: get('timeFormat'),
        },
      ),
    [get],
  );

  const save = useCallback(
    async (input: Partial<Preferences>): Promise<Preferences> => {
      if (isPending) {
        throw new Error(t('loadError'));
      }

      if (sessionError) {
        throw new Error(sessionError.message || t('saveError'));
      }

      if (session) {
        return store.getState().save(input);
      }

      const preferences = resolvePreferences({ ...readLocal(), ...input });

      for (const key of preferenceKeys) {
        set(key, preferences[key], preferenceCookieOptions);
      }

      store.getState().hydrate(preferences);

      return preferences;
    },
    [isPending, sessionError, session, store, readLocal, set, t],
  );

  const load = useCallback(
    async (force = false): Promise<Preferences | undefined> => {
      if (isPending || sessionError) {
        return undefined;
      }

      if (session) {
        return store.getState().load(force);
      }

      const preferences = readLocal();

      store.getState().hydrate(preferences);

      return preferences;
    },
    [isPending, sessionError, session, store, readLocal],
  );

  const reload = useCallback(() => load(true), [load]);

  const formatDateTime = useCallback(
    (value: Parameters<typeof formatDateTimeValue>[0]) => formatDateTimeValue(value, timeFormat),
    [timeFormat],
  );

  return useStore(
    store,
    useShallow((state) =>
      selector({
        ...state,
        sessionStatus: isPending ? 'pending' : sessionError ? 'error' : session ? 'authenticated' : 'guest',
        loading: state.loading || isPending,
        load,
        reload,
        save,
        formatDateTime,
      }),
    ),
  );
}
