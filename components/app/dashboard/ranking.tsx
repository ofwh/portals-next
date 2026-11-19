'use client';

import { Copy, Search } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ANALYTICS_LIMITS, ANALYTICS_ROUTE_TYPES } from '@/lib/constants/analytics';
import { ROUTE_ICONS } from '@/lib/constants/route-icons';
import type { AnalyticsLimit, AnalyticsRanking, AnalyticsRankingItem } from '@/lib/types/analytics';
import type { DashboardCategory, DashboardQuery } from '@/lib/types/dashboard';
import { QueryFeedback } from './query-feedback';

const RANKING_CATEGORIES = ['all', ...ANALYTICS_ROUTE_TYPES] as const;

function RankingList({ items, search }: { items: AnalyticsRankingItem[]; search: string }) {
  const t = useTranslations();
  const format = useFormatter();
  const term = search.trim().toLowerCase();
  const matches = items
    .map((item, index) => ({ item, rank: index + 1 }))
    .filter(({ item }) => item.url.toLowerCase().includes(term));

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('shared.copySuccess'));
    } catch {
      toast.error(t('shared.copyError'));
    }
  }

  if (!matches.length) {
    return (
      <p role="status" className="text-muted-foreground py-8 text-center text-sm">
        {t(items.length ? 'admin.dashboard.rankingNoMatches' : 'admin.dashboard.noVisits')}
      </p>
    );
  }

  return (
    <ol role="list" className="space-y-4">
      {matches.map(({ item, rank }) => {
        const Icon = ROUTE_ICONS[item.routeType];

        return (
          <li
            key={`${item.routeType}:${item.url}`}
            className="group bg-muted/55 hover:bg-muted grid min-h-17.5 cursor-default grid-cols-[auto_minmax(0,1fr)_auto_auto] grid-rows-[auto_auto] items-center gap-x-2.5 rounded-lg p-3 transition-colors @lg/ranking:gap-x-4"
          >
            <div className="border-border col-start-1 row-span-2 row-start-1 grid size-10 place-items-center rounded-lg border @lg/ranking:size-12">
              <Icon aria-hidden="true" className="size-5" />
            </div>
            <div className="col-span-2 col-start-2 row-start-1 flex min-w-0 items-center gap-1.5 self-end @lg/ranking:col-span-1">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="focus-visible:ring-ring min-w-0 cursor-pointer truncate rounded-sm font-medium no-underline focus-visible:ring-2 focus-visible:outline-none"
                    />
                  }
                >
                  {item.url}
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs break-all sm:max-w-md">
                  {item.url}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="opacity-100 focus-visible:opacity-100 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100 [@media(hover:none)]:opacity-100"
                      aria-label={t('shared.copyPath')}
                      onClick={() => void copy(item.url)}
                    />
                  }
                >
                  <Copy aria-hidden="true" />
                </TooltipTrigger>
                <TooltipContent side="top">{t('shared.copyPath')}</TooltipContent>
              </Tooltip>
            </div>
            <p className="text-muted-foreground col-start-2 row-start-2 self-start text-xs tabular-nums">
              {t('admin.dashboard.rankingPosition', { rank: format.number(rank) })}
            </p>
            <Badge
              variant="outline"
              className="col-start-3 row-start-2 self-start @lg/ranking:row-span-2 @lg/ranking:row-start-1 @lg/ranking:self-center"
            >
              {t(`admin.sidebar.${item.routeType}`)}
            </Badge>
            <div className="col-start-4 row-span-2 row-start-1 min-w-12 text-right @lg/ranking:min-w-20">
              <div className="text-muted-foreground text-xs tracking-wide uppercase">{t('admin.dashboard.visits')}</div>
              <div className="font-medium tabular-nums">{format.number(item.count)}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function Ranking({
  query,
  category,
  onCategoryChange,
  limit,
  onLimitChange,
}: {
  query: DashboardQuery<AnalyticsRanking>;
  category: DashboardCategory;
  onCategoryChange: (value: DashboardCategory) => void;
  limit: AnalyticsLimit;
  onLimitChange: (value: AnalyticsLimit) => void;
}) {
  const t = useTranslations();
  const [search, setSearch] = useState('');
  const searchLabel = t('admin.dashboard.rankingSearch');
  const items = ANALYTICS_LIMITS.map((value) => ({ value, label: t('admin.dashboard.topN', { count: value }) }));

  return (
    <Card size="sm" className="@container/ranking relative" aria-busy={query.loading}>
      {query.loading && query.data && (
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 overflow-hidden">
          <div className="bg-primary animate-loading-progress h-full w-[35%] motion-reduce:w-full motion-reduce:animate-none" />
        </div>
      )}
      <Tabs
        value={category}
        onValueChange={(value) => {
          const next = RANKING_CATEGORIES.find((category) => category === value);

          if (next) {
            onCategoryChange(next);
          }
        }}
        className="gap-4"
      >
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">
              <h2>{t('admin.dashboard.rankingTitle')}</h2>
            </CardTitle>
            <Select
              value={limit}
              items={items}
              onValueChange={(value) => {
                const next = ANALYTICS_LIMITS.find((limit) => limit === value);

                if (next) {
                  onLimitChange(next);
                }
              }}
            >
              <SelectTrigger size="sm" aria-label={t('admin.dashboard.rankingLimit')}>
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <InputGroup className="h-8 grow basis-56 @lg/ranking:max-w-sm">
              <InputGroupInput
                type="search"
                aria-label={searchLabel}
                placeholder={searchLabel}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-full"
              />
              <InputGroupAddon>
                <Search aria-hidden="true" />
              </InputGroupAddon>
            </InputGroup>
            <div className="-my-1 max-w-full min-w-0 overflow-x-auto py-1">
              <TabsList aria-label={t('admin.dashboard.rankingCategory')}>
                {RANKING_CATEGORIES.map((value) => (
                  <TabsTrigger key={value} value={value}>
                    {value === 'all' ? t('admin.dashboard.all') : t(`admin.sidebar.${value}`)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TabsContent value={category} className="space-y-4">
            <QueryFeedback query={query} title={t('admin.dashboard.rankingError')} />
            {!query.data && query.loading && (
              <div className="space-y-4" aria-hidden="true">
                {Array.from({ length: limit }, (_, index) => (
                  <Skeleton key={index} className="h-17.5 w-full rounded-lg" />
                ))}
              </div>
            )}
            {query.data && <RankingList items={query.data.ranking} search={search} />}
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
