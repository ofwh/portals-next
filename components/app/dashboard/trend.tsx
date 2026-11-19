'use client';

import { useFormatter, useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ANALYTICS_ROUTE_TYPES } from '@/lib/constants/analytics';
import { DASHBOARD_COLORS, DASHBOARD_RANGES } from '@/lib/constants/dashboard';
import type { RouteType } from '@/lib/constants/routes';
import type { AnalyticsTotals } from '@/lib/types/analytics';
import type { DashboardQuery, DashboardTimeRange } from '@/lib/types/dashboard';
import { QueryFeedback } from './query-feedback';

function TimeRange({ value, onChange }: { value: DashboardTimeRange; onChange: (value: DashboardTimeRange) => void }) {
  const t = useTranslations('admin.dashboard');
  const items = DASHBOARD_RANGES.map((value) => ({ value, label: t(`ranges.${value}`) }));

  return (
    <>
      <ToggleGroup
        value={[value]}
        multiple={false}
        onValueChange={(values) => {
          const next = DASHBOARD_RANGES.find((range) => range === values[0]);

          if (next) {
            onChange(next);
          }
        }}
        variant="outline"
        spacing={0}
        size="sm"
        aria-label={t('timeRange')}
        className="hidden shrink-0 @3xl/trend:flex"
      >
        {items.map((item) => (
          <ToggleGroupItem key={item.value} value={item.value} className="px-4">
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className="shrink-0 @3xl/trend:hidden">
        <Select
          value={value}
          items={items}
          onValueChange={(selected) => {
            const next = DASHBOARD_RANGES.find((range) => range === selected);

            if (next) {
              onChange(next);
            }
          }}
        >
          <SelectTrigger size="sm" aria-label={t('timeRange')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="bottom" alignItemWithTrigger={false} className="min-w-0">
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

function TrendLegend({ hidden, onToggle }: { hidden: ReadonlySet<RouteType>; onToggle: (type: RouteType) => void }) {
  const t = useTranslations();

  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2 pt-3"
      role="group"
      aria-label={t('admin.dashboard.legend')}
    >
      {ANALYTICS_ROUTE_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          aria-pressed={!hidden.has(type)}
          onClick={() => onToggle(type)}
          className="focus-visible:ring-ring inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-sm transition-opacity focus-visible:ring-2 focus-visible:outline-none"
          style={{ opacity: hidden.has(type) ? 0.45 : 1 }}
        >
          <span
            className="size-2.5 rounded-full"
            style={{ backgroundColor: DASHBOARD_COLORS[type] }}
            aria-hidden="true"
          />
          {t(`admin.sidebar.${type}`)}
        </button>
      ))}
    </div>
  );
}

export function Trend({
  query,
  range,
  onRangeChange,
}: {
  query: DashboardQuery<AnalyticsTotals>;
  range: DashboardTimeRange;
  onRangeChange: (value: DashboardTimeRange) => void;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const format = useFormatter();
  const [hidden, setHidden] = useState<ReadonlySet<RouteType>>(new Set());
  const config: ChartConfig = Object.fromEntries(
    ANALYTICS_ROUTE_TYPES.map((type) => [type, { label: t(`admin.sidebar.${type}`), color: DASHBOARD_COLORS[type] }]),
  );
  const axisFormat = new Intl.DateTimeFormat(
    locale,
    query.data?.granularity === 'hour'
      ? { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }
      : { month: 'short', day: 'numeric' },
  );

  const tooltipFormat = new Intl.DateTimeFormat(
    locale,
    query.data?.granularity === 'hour'
      ? { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }
      : { month: 'short', day: 'numeric' },
  );

  function toggle(type: RouteType) {
    setHidden((current) => {
      const next = new Set(current);

      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }

      return next;
    });
  }

  return (
    <Card className="@container/trend relative" aria-busy={query.loading}>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <CardTitle>
            <h2>{t('admin.dashboard.trendTitle')}</h2>
          </CardTitle>
          <CardDescription>{t('admin.dashboard.trendDescription')}</CardDescription>
        </div>
        <TimeRange value={range} onChange={onRangeChange} />
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <QueryFeedback query={query} title={t('admin.dashboard.trendError')} />
        {!query.data && query.loading && <Skeleton className="h-62 w-full" aria-hidden="true" />}
        {query.data && (
          <>
            <ChartContainer
              config={config}
              className="aspect-auto h-62 w-full"
              aria-label={t('admin.dashboard.trendTitle')}
            >
              <AreaChart accessibilityLayer data={query.data.series} margin={{ left: 4, right: 12, top: 6 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => axisFormat.format(new Date(value))}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => tooltipFormat.format(new Date(String(value)))}
                      indicator="dot"
                      formatter={(value, name) => {
                        const type = ANALYTICS_ROUTE_TYPES.find((type) => type === name);

                        return type ? (
                          <div className="flex w-full items-center gap-2">
                            <span
                              className="size-2.5 shrink-0 rounded-[2px]"
                              style={{ backgroundColor: DASHBOARD_COLORS[type] }}
                            />
                            <span className="text-muted-foreground">{t(`admin.sidebar.${type}`)}</span>
                            <span className="ml-auto font-mono font-medium tabular-nums">
                              {format.number(Number(value))}
                            </span>
                          </div>
                        ) : null;
                      }}
                    />
                  }
                />
                <ChartLegend content={<TrendLegend hidden={hidden} onToggle={toggle} />} />
                {ANALYTICS_ROUTE_TYPES.map((type) => (
                  <Area
                    key={type}
                    type="monotone"
                    dataKey={type}
                    stroke={`var(--color-${type})`}
                    fill="none"
                    fillOpacity={0}
                    strokeWidth={1.5}
                    strokeOpacity={1}
                    dot={false}
                    hide={hidden.has(type)}
                  />
                ))}
              </AreaChart>
            </ChartContainer>
            {query.data.totalRequests === 0 && (
              <p role="status" className="text-muted-foreground text-center text-sm">
                {t('admin.dashboard.noVisits')}
              </p>
            )}
            {hidden.size === ANALYTICS_ROUTE_TYPES.length && (
              <p role="status" className="text-muted-foreground text-center text-sm">
                {t('admin.dashboard.allHidden')}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
