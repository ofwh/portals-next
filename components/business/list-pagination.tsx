'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { PaginationParams } from '@/lib/types/pagination';

export function ListPagination({
  page,
  size,
  total,
  disabled,
  onChange,
}: PaginationParams & {
  total: number;
  disabled: boolean;
  onChange(value: PaginationParams): void;
}) {
  const t = useTranslations();

  if (total <= 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
      <span className="text-muted-foreground text-sm">{t('shared.total', { count: total })}</span>
      <Pagination className="mx-0 w-auto" aria-label={t('shared.pagination')}>
        <PaginationContent>
          <PaginationItem>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={disabled || page <= 1}
              onClick={() => onChange({ page: page - 1, size })}
              aria-label={t('shared.previousPage')}
            >
              <ChevronLeft />
            </Button>
          </PaginationItem>
          <PaginationItem>
            <Button variant="outline" size="icon-sm" aria-current="page" disabled={disabled}>
              {page}
            </Button>
          </PaginationItem>
          <PaginationItem>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={disabled || page * size >= total}
              onClick={() => onChange({ page: page + 1, size })}
              aria-label={t('shared.nextPage')}
            >
              <ChevronRight />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
      <Select
        disabled={disabled}
        value={String(size)}
        onValueChange={(value) => {
          if (value !== null) {
            onChange({ size: Number(value), page: 1 });
          }
        }}
        items={[10, 20, 50].map((size) => ({
          value: String(size),
          label: t('shared.pageSize', { count: size }),
        }))}
      >
        <SelectTrigger size="sm" aria-label={t('shared.rowsPerPage')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent side="bottom" alignItemWithTrigger={false}>
          {[10, 20, 50].map((size) => (
            <SelectItem key={size} value={String(size)}>
              {t('shared.pageSize', { count: size })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
