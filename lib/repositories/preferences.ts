import 'server-only';
import { db } from '@/lib/db';
import { preferences } from '@/lib/db/schema';
import { preferenceKeys } from '@/lib/preferences';
import type { Preferences, PreferenceValues } from '@/lib/types/preferences';

export function get(): PreferenceValues {
  const values: PreferenceValues = {};

  for (const row of db.select({ key: preferences.key, value: preferences.value }).from(preferences).all()) {
    const key = preferenceKeys.find((key) => key === row.key);

    if (key) {
      values[key] = row.value;
    }
  }

  return values;
}

export function update(values: Partial<Preferences>): void {
  db.transaction((tx) => {
    for (const key of preferenceKeys) {
      const value = values[key];

      if (value !== undefined) {
        tx.insert(preferences)
          .values({ key, value })
          .onConflictDoUpdate({ target: preferences.key, set: { value } })
          .run();
      }
    }
  });
}

const repository = { get, update };

export default repository;
