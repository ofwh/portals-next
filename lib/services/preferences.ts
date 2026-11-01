import 'server-only';
import { locales } from '@/i18n/config';
import { appError } from '@/lib/api';
import { normalizeTimeFormat, preferenceKeys, resolvePreferences, themes } from '@/lib/preferences';
import repository from '@/lib/repositories/preferences';
import type { Preferences, PreferenceValues } from '@/lib/types/preferences';
import * as v from './validation';

export function get(input: unknown, fallback: PreferenceValues = {}): Preferences {
  if (Object.keys(v.record(input)).length > 0) {
    throw appError('common.INVALID_PARAMS');
  }

  return resolvePreferences(repository.get(), fallback);
}

export function update(input: unknown, fallback: PreferenceValues = {}): Preferences {
  const params = v.record(input);

  if (Object.keys(params).some((key) => !preferenceKeys.some((allowed) => allowed === key))) {
    throw appError('common.INVALID_PARAMS');
  }

  const changes: Partial<Preferences> = {};

  if (params.theme !== undefined) {
    changes.theme = v.choice(params.theme, themes);
  }

  if (params.language !== undefined) {
    changes.language = v.choice(params.language, locales);
  }

  if (params.timeFormat !== undefined) {
    const timeFormat = normalizeTimeFormat(v.string(params.timeFormat));

    if (!timeFormat) {
      throw appError('common.INVALID_PARAMS');
    }

    changes.timeFormat = timeFormat;
  }

  repository.update(changes);

  return get({}, fallback);
}

const service = { get, update };

export default service;
