'use client';

import { Copy } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ANALYTICS_LIMITS, ANALYTICS_ROUTE_TYPES } from '@/lib/constants/analytics';
import type { AnalyticsLimit, AnalyticsRanking, AnalyticsRankingItem } from '@/lib/types/analytics';
import type { DashboardCategory, DashboardQuery } from '@/lib/types/dashboard';
import { QueryFeedback } from './query-feedback';

function RankingList({ items, showCategory }: { items: AnalyticsRankingItem[]; showCategory: boolean }) {
  const t = useTranslations();
  const format = useFormatter();

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('shared.copySuccess'));
    } catch {
      toast.error(t('shared.copyError'));
    }
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <Table className={showCategory ? 'min-w-140 table-fixed' : 'table-fixed'}>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">{t('admin.dashboard.rank')}</TableHead>
            {showCategory && <TableHead className="w-32">{t('admin.dashboard.type')}</TableHead>}
            <TableHead>{t('admin.dashboard.url')}</TableHead>
            <TableHead className="w-24 text-right">{t('admin.dashboard.visits')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow
              key={`${item.routeType}:${item.url}`}
              className="group cursor-pointer"
              onClick={(event) => {
                if (event.target instanceof Element && !event.target.closest('a,button')) {
                  window.open(item.url, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              <TableCell className="text-muted-foreground tabular-nums">{format.number(index + 1)}</TableCell>
              {showCategory && (
                <TableCell>
                  <Badge variant="secondary">{t(`admin.sidebar.${item.routeType}`)}</Badge>
                </TableCell>
              )}
              <TableCell className="min-w-0">
                <div className="flex min-w-0 items-center gap-1.5">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="focus-visible:ring-ring min-w-0 truncate rounded-sm hover:underline focus-visible:ring-2 focus-visible:outline-none"
                        />
                      }
                    >
                      {item.url}
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-md break-all">
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
              </TableCell>
              <TableCell className="text-right tabular-nums">{format.number(item.count)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
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
  const items = ANALYTICS_LIMITS.map((value) => ({ value, label: t('admin.dashboard.topN', { count: value }) }));

  return (
    <Card className="relative" aria-busy={query.loading}>
      <Tabs
        value={category}
        onValueChange={(value) => {
          const type = ANALYTICS_ROUTE_TYPES.find((type) => type === value);

          if (value === 'all') {
            onCategoryChange('all');
          } else if (type) {
            onCategoryChange(type);
          }
        }}
        className="gap-6"
      >
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>
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
          <div className="min-w-0 overflow-x-auto pb-1">
            <TabsList aria-label={t('admin.dashboard.rankingCategory')}>
              <TabsTrigger value="all">{t('admin.dashboard.all')}</TabsTrigger>
              {ANALYTICS_ROUTE_TYPES.map((type) => (
                <TabsTrigger key={type} value={type}>
                  {t(`admin.sidebar.${type}`)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </CardHeader>
        <CardContent>
          <TabsContent value={category} className="space-y-3">
            <QueryFeedback query={query} title={t('admin.dashboard.rankingError')} />
            {!query.data && query.loading && (
              <div className="space-y-2" aria-hidden="true">
                {Array.from({ length: limit }, (_, index) => (
                  <Skeleton key={`row-${index}`} className="h-10 w-full" />
                ))}
              </div>
            )}
            {query.data &&
              (query.data.ranking.length ? (
                <RankingList items={query.data.ranking} showCategory={category === 'all'} />
              ) : (
                <p role="status" className="text-muted-foreground py-8 text-center text-sm">
                  {t('admin.dashboard.noVisits')}
                </p>
              ))}
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
