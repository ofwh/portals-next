'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { PageHeader } from '@/components/business/page-header';
import type { RouteMode } from '@/lib/constants/routes';

export function RouteHeader({ mode, children }: { mode: RouteMode; children: ReactNode }) {
  const t = useTranslations();

  return (
    <PageHeader
      titleId={`${mode}-title`}
      title={t(`admin.routes.${mode}.title`)}
      description={t(`admin.routes.${mode}.description`)}
    >
      {children}
    </PageHeader>
  );
}
