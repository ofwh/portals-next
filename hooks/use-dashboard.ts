'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getOverview, getRanking, getTotals } from '@/lib/client/dashboard';
import { DASHBOARD_RANGE_MS } from '@/lib/constants/dashboard';
import type { AnalyticsGranularity, AnalyticsLimit } from '@/lib/types/analytics';
import type { DashboardCategory, DashboardQuery, DashboardTimeRange } from '@/lib/types/dashboard';

const OVERVIEW_PARAMS = {};

function windowFor(range: DashboardTimeRange) {
  const to = Date.now();

  return { from: to - DASHBOARD_RANGE_MS[range], to };
}

function useDashboardQuery<Params, Result>(
  load: (params: Params, signal: AbortSignal) => Promise<Result>,
  params: Params,
  revision: number,
): DashboardQuery<Result> {
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify([params, revision, attempt]);
  const [state, setState] = useState<{
    key: string | null;
    snapshot: { key: string; data: Result } | null;
    error: string | null;
  }>({ key: null, snapshot: null, error: null });

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      try {
        const data = await load(params, controller.signal);

        if (!controller.signal.aborted) {
          setState({ key, snapshot: { key, data }, error: null });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setState((current) => ({ ...current, key, error: error instanceof Error ? error.message : '' }));
        }
      }
    }

    void fetchData();

    return () => controller.abort();
  }, [load, params, key]);

  const retry = useCallback(() => setAttempt((current) => current + 1), []);
  const loading = state.key !== key;

  return {
    data: state.snapshot?.data ?? null,
    loading,
    stale: state.snapshot !== null && state.snapshot.key !== key,
    error: loading ? null : state.error,
    retry,
  };
}

export function useDashboard() {
  const [range, setRange] = useState<DashboardTimeRange>('24h');
  const [window, setWindow] = useState(() => windowFor('24h'));
  const [revision, setRevision] = useState(0);
  const [category, setCategory] = useState<DashboardCategory>('all');
  const [limit, setLimit] = useState<AnalyticsLimit>(10);
  const totalsParams = useMemo(
    () => ({ ...window, granularity: (range === '24h' ? 'hour' : 'day') as AnalyticsGranularity }),
    [window, range],
  );
  const rankingParams = useMemo(() => ({ ...window, category, limit }), [window, category, limit]);
  const overview = useDashboardQuery(getOverview, OVERVIEW_PARAMS, revision);
  const totals = useDashboardQuery(getTotals, totalsParams, revision);
  const ranking = useDashboardQuery(getRanking, rankingParams, revision);

  function changeRange(value: DashboardTimeRange) {
    if (value !== range) {
      setRange(value);
      setWindow(windowFor(value));
    }
  }

  function refresh() {
    setWindow(windowFor(range));
    setRevision((current) => current + 1);
  }

  return {
    overview,
    totals,
    ranking,
    range,
    changeRange,
    category,
    setCategory,
    limit,
    setLimit,
    refresh,
    loading: overview.loading || totals.loading || ranking.loading,
  };
}
