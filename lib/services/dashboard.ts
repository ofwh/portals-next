import 'server-only';
import { appError } from '@/lib/api';
import { SHORTCUT_ROUTES } from '@/lib/constants/shortcuts';
import { getAppContext } from '@/lib/context';
import repository from '@/lib/repositories/dashboard';
import type { DashboardOverview } from '@/lib/types/dashboard';
import * as v from './shared/validation';

export function overview(input: unknown): DashboardOverview {
  if (Object.keys(v.record(input)).length > 0) {
    throw appError('common.INVALID_PARAMS');
  }

  const shortcuts = getAppContext().config.shortcuts;
  const entries = new Map(
    Object.entries(SHORTCUT_ROUTES).map(([key, type]) => [type, shortcuts[key as keyof typeof SHORTCUT_ROUTES].status]),
  );

  return {
    cards: repository.overview().map((card) => ({ ...card, entryEnabled: entries.get(card.routeType) ?? true })),
  };
}

const service = { overview };

export default service;
