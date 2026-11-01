import { createStore } from 'zustand/vanilla';
import { DEFAULT_PREFERENCES } from '@/lib/preferences';
import { getPreferences, updatePreferences } from '@/lib/requests/preferences';
import type { Preferences } from '@/lib/types/preferences';

export type PreferencesState = {
  preferences: Preferences;
  loading: boolean;
  saving: boolean;
  error: string | null;
  saveError: string | null;
  hydrate: (preferences: Preferences) => void;
  load: (force?: boolean) => Promise<Preferences | undefined>;
  reload: () => Promise<Preferences | undefined>;
  save: (input: Partial<Preferences>) => Promise<Preferences>;
};

export type PreferencesStore = ReturnType<typeof createPreferencesStore>;

export function createPreferencesStore(initialPreferences?: Preferences) {
  return createStore<PreferencesState>()((setState, getState) => {
    let loaded = initialPreferences !== undefined;
    let revision = 0;
    let loadRequest: Promise<Preferences | undefined> | null = null;
    let loadController: AbortController | null = null;
    let saveQueue = Promise.resolve();
    let pendingSaves = 0;

    function cancelLoad() {
      loadController?.abort();
      loadController = null;
      loadRequest = null;
    }

    function hydrate(preferences: Preferences) {
      if (pendingSaves > 0) {
        return;
      }

      revision += 1;
      loaded = true;
      cancelLoad();
      setState({ preferences, loading: false, error: null });
    }

    function load(force = false): Promise<Preferences | undefined> {
      if (pendingSaves > 0) {
        return saveQueue.then(() => load(force));
      }

      if (loadRequest) {
        return loadRequest;
      }

      if (loaded && !force) {
        return Promise.resolve(getState().preferences);
      }

      const currentRevision = revision;
      const controller = new AbortController();

      loadController = controller;
      setState({ loading: true, error: null });
      loadRequest = getPreferences(controller.signal)
        .then((preferences) => {
          if (!controller.signal.aborted && currentRevision === revision) {
            loaded = true;
            setState({ preferences, error: null });

            return preferences;
          }

          return undefined;
        })
        .catch((reason: unknown) => {
          if (!controller.signal.aborted && currentRevision === revision) {
            setState({ error: reason instanceof Error ? reason.message : '' });
          }

          return undefined;
        })
        .finally(() => {
          if (loadController === controller) {
            loadRequest = null;
            loadController = null;
            setState({ loading: false });
          }
        });

      return loadRequest;
    }

    function reload(): Promise<Preferences | undefined> {
      return load(true);
    }

    function save(input: Partial<Preferences>): Promise<Preferences> {
      const changes = { ...input };

      pendingSaves += 1;
      cancelLoad();
      setState({ loading: false, saving: true, saveError: null });

      const request = saveQueue.then(async () => {
        try {
          const preferences = await updatePreferences(changes);

          revision += 1;
          loaded = true;
          setState({ preferences, error: null, saveError: null });

          return preferences;
        } catch (reason) {
          setState({ saveError: reason instanceof Error ? reason.message : '' });

          throw reason;
        } finally {
          pendingSaves -= 1;
          setState({ saving: pendingSaves > 0 });
        }
      });

      saveQueue = request.then(
        () => undefined,
        () => undefined,
      );

      return request;
    }

    return {
      preferences: initialPreferences ?? DEFAULT_PREFERENCES,
      loading: initialPreferences === undefined,
      saving: false,
      error: null,
      saveError: null,
      hydrate,
      load,
      reload,
      save,
    };
  });
}
