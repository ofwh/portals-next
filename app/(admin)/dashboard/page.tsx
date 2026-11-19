'use client';

import { LoaderCircle, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Overview } from '@/components/app/dashboard/overview';
import { Ranking } from '@/components/app/dashboard/ranking';
import { Trend } from '@/components/app/dashboard/trend';
import { PageHeader } from '@/components/business/page-header';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/hooks/use-dashboard';

export default function Page() {
  const t = useTranslations();
  const dashboard = useDashboard();

  return (
    <section className="@container/dashboard mx-auto w-full max-w-375 lg:p-2" aria-labelledby="dashboard-title">
      <PageHeader
        titleId="dashboard-title"
        title={t('admin.dashboard.title')}
        description={t('admin.dashboard.description')}
      >
        <Button
          type="button"
          variant="outline"
          onClick={dashboard.refresh}
          disabled={dashboard.loading}
          aria-busy={dashboard.loading}
        >
          {dashboard.loading ? (
            <LoaderCircle aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
          ) : (
            <RefreshCw aria-hidden="true" />
          )}
          {t('shared.refresh')}
        </Button>
      </PageHeader>
      <div className="flex flex-col gap-4 md:gap-6">
        <Overview query={dashboard.overview} />
        <Trend query={dashboard.totals} range={dashboard.range} onRangeChange={dashboard.changeRange} />
        <Ranking
          query={dashboard.ranking}
          category={dashboard.category}
          onCategoryChange={dashboard.setCategory}
          limit={dashboard.limit}
          onLimitChange={dashboard.setLimit}
        />
      </div>
    </section>
  );
}
