'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

export default function Layout({ children, management }: { children: ReactNode; management: ReactNode }) {
  const t = useTranslations('admin.settings.system');

  return (
    <section className="mx-auto w-full max-w-375 lg:p-2" aria-labelledby="system-title">
      <div className="mb-8">
        <h1 id="system-title" className="text-2xl font-semibold tracking-tight">
          {t('title')}
        </h1>
        <p className="text-muted-foreground mt-2 text-sm" />
      </div>
      {management}
      {children}
    </section>
  );
}
