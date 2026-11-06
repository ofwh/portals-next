'use client';
import { LoaderCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { Table } from '@/components/ui/table';
import type { RouteMode } from '@/lib/constants/routes';

export function RouteTable({
  mode,
  loading,
  initialLoading,
  children,
}: {
  mode: RouteMode;
  loading: boolean;
  initialLoading: boolean;
  children: ReactNode;
}) {
  const t = useTranslations();

  return (
    <div className="relative overflow-hidden rounded-md border">
      {loading && !initialLoading && (
        <div
          role="progressbar"
          aria-label={t(`admin.routes.${mode}.loading`)}
          className="bg-primary/10 pointer-events-none absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden"
        >
          <div className="bg-primary animate-loading-progress h-full w-[35%] motion-reduce:w-full motion-reduce:animate-none" />
        </div>
      )}
      {initialLoading ? (
        <div
          role="status"
          aria-busy={loading}
          className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm"
        >
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          {t(`admin.routes.${mode}.loading`)}
        </div>
      ) : (
        <Table className="min-w-275" aria-busy={loading}>
          {children}
        </Table>
      )}
    </div>
  );
}
