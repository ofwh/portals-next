import { appError } from '@/lib/api';
import type { FlowSnapshot } from './index';
import { restoreSnapshot, serializeSnapshot } from './snapshot';

export interface SnapshotStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function createSnapshotStorage(storage: SnapshotStorage, key: string, delay = 500) {
  let phase: 'unread' | 'restored' | 'ready' = 'unread';
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: FlowSnapshot | undefined;
  const clear = () => {
    if (timer !== undefined) {
      clearTimeout(timer);
      timer = undefined;
    }
  };
  const save = (snapshot: FlowSnapshot) => {
    if (phase !== 'ready') {
      throw appError('workflow.SNAPSHOT_NOT_READY');
    }

    const raw = serializeSnapshot(snapshot);

    storage.setItem(key, raw);
    pending = undefined;
  };

  return {
    restore(): FlowSnapshot | null {
      clear();
      phase = 'unread';
      pending = undefined;
      const raw = storage.getItem(key);
      const snapshot = raw === null ? null : restoreSnapshot(raw);

      phase = 'restored';

      return snapshot;
    },
    activate(): void {
      if (phase !== 'restored') {
        throw appError('workflow.SNAPSHOT_NOT_READY');
      }

      phase = 'ready';
    },
    save(snapshot: FlowSnapshot): void {
      clear();
      save(snapshot);
    },
    schedule(snapshot: FlowSnapshot, onError: (error: unknown) => void): void {
      if (phase !== 'ready') {
        return;
      }

      clear();
      pending = restoreSnapshot(serializeSnapshot(snapshot));
      timer = setTimeout(() => {
        timer = undefined;
        if (pending) {
          try {
            save(pending);
          } catch (error) {
            onError(error);
          }
        }
      }, delay);
    },
    flush(): void {
      clear();
      if (pending) {
        save(pending);
      }
    },
    dispose(): void {
      clear();
      pending = undefined;
      phase = 'unread';
    },
  };
}
