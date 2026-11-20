'use client';

import { ArrowRightLeft, Database, FileText, Rss, Share2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ANALYTICS_ROUTE_TYPES } from '@/lib/constants/analytics';
import type { DashboardOverview, DashboardQuery } from '@/lib/types/dashboard';
import { QueryFeedback } from './query-feedback';

const ICONS = { proxies: Share2, redirects: ArrowRightLeft, caches: Database, originals: FileText, subscriptions: Rss };

function fitBounds(svg: SVGSVGElement | null) {
  if (!svg) {
    return;
  }

  const bounds = svg.getBBox();
  const strokeWidth = Number(svg.getAttribute('stroke-width') ?? 1);
  const width = bounds.width + strokeWidth;
  const height = bounds.height + strokeWidth;

  if (bounds.width <= 0 || bounds.height <= 0) {
    return;
  }

  svg.setAttribute('viewBox', `${bounds.x - strokeWidth / 2} ${bounds.y - strokeWidth / 2} ${width} ${height}`);
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
}

function OverviewBackground({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div
      aria-hidden="true"
      className="text-foreground pointer-events-none absolute right-(--card-spacing) bottom-(--card-spacing) -z-10 h-[36%] opacity-[0.025] select-none dark:opacity-[0.035]"
    >
      <Icon ref={fitBounds} strokeWidth={1} preserveAspectRatio="xMaxYMax meet" className="h-full w-auto max-w-none" />
    </div>
  );
}

export function Overview({ query }: { query: DashboardQuery<DashboardOverview> }) {
  const t = useTranslations();
  const format = useFormatter();

  return (
    <section aria-labelledby="overview-title" aria-busy={query.loading} className="space-y-4">
      <h2 id="overview-title" className="sr-only">
        {t('admin.dashboard.overviewTitle')}
      </h2>
      <QueryFeedback query={query} title={t('admin.dashboard.overviewError')} />
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs @xl/dashboard:grid-cols-2 @3xl/dashboard:grid-cols-3 @5xl/dashboard:grid-cols-5">
        {query.data?.cards.map((card) => {
          const Icon = ICONS[card.routeType];

          return (
            <Card key={card.routeType} className="@container/overview-card relative isolate min-w-0">
              <OverviewBackground icon={Icon} />
              <CardHeader>
                <CardDescription className="text-foreground text-base font-medium">
                  {t(`admin.sidebar.${card.routeType}`)}
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/overview-card:text-3xl">
                  {format.number(card.total)}
                </CardTitle>
                <CardAction>
                  <Badge variant={card.entryEnabled ? 'default' : 'secondary'}>
                    {t(`admin.dashboard.${card.entryEnabled ? 'entryEnabled' : 'entryDisabled'}`)}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <p className="line-clamp-1 font-medium tabular-nums">
                  {t('admin.dashboard.counts', {
                    enabled: format.number(card.enabled),
                    disabled: format.number(card.disabled),
                  })}
                </p>
              </CardFooter>
            </Card>
          );
        })}
        {!query.data &&
          query.loading &&
          ANALYTICS_ROUTE_TYPES.map((type) => (
            <Card key={type} aria-hidden="true">
              <CardHeader>
                <Skeleton className="h-5 w-24" />
                <Skeleton className="mt-3 h-9 w-16" />
              </CardHeader>
              <CardFooter className="flex-col items-start gap-2">
                <Skeleton className="h-4 w-32" />
              </CardFooter>
            </Card>
          ))}
      </div>
    </section>
  );
}
