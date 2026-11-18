'use client';

import { useTranslations } from 'next-intl';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { DashboardQuery } from '@/lib/types/dashboard';

export function QueryFeedback({ query, title }: { query: DashboardQuery<unknown>; title: string }) {
  const t = useTranslations();

  return (
    <>
      {query.loading && query.data === null && (
        <p role="status" className="sr-only">
          {t('admin.dashboard.loading')}
        </p>
      )}
      {query.error !== null && (
        <Alert variant="destructive" role="alert">
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>
            <p>{query.error || t('shared.loadErrorDescription')}</p>
            {query.stale && <p>{t('admin.dashboard.previousResults')}</p>}
            <Button type="button" variant="outline" size="sm" className="mt-2 w-fit" onClick={query.retry}>
              {t('shared.retry')}
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}
