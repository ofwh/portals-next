'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { ShortcutForm } from '@/components/app/settings/system/shortcut-form';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useShortcuts } from '@/hooks/use-shortcuts';

export default function Page() {
  const t = useTranslations();
  const { items, loading, loaded, saving, error, load, save } = useShortcuts();
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    void load(controller.signal);

    return () => controller.abort();
  }, [load, revision]);

  return (
    <section className="w-full max-w-3xl" aria-labelledby="system-shortcuts-title" aria-busy={loading}>
      <div className="mb-6">
        <h2 id="system-shortcuts-title" className="text-lg font-semibold">
          {t('admin.settings.system.tabs.shortcuts')}
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
          {t('admin.settings.system.shortcuts.description')}
        </p>
      </div>
      {loading && !loaded ? (
        <div role="status" aria-label={t('admin.settings.system.loading')} className="space-y-8">
          {['proxy', 'redirect', 'cache', 'original'].map((type) => (
            <div key={type} className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <ShortcutForm
          items={items}
          disabled={!loaded || loading || saving || error !== null}
          saving={saving}
          save={save}
        />
      )}
      {error !== null && (
        <div role="alert" className="text-destructive mt-6 flex items-center justify-between gap-3 text-sm">
          <span>{error || t('admin.settings.system.loadError')}</span>
          <Button type="button" variant="outline" disabled={loading} onClick={() => setRevision((value) => value + 1)}>
            {t('shared.retry')}
          </Button>
        </div>
      )}
    </section>
  );
}
