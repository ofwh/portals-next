'use client';

import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { ListToolbar } from '@/components/business/list-toolbar';
import type { RouteMode } from '@/lib/constants/routes';
import { RouteDelete } from './route-delete';

interface RouteToolbarProps {
  mode: RouteMode;
  deleteAction?: ReactNode;
  search: string;
  status: 'all' | 'enabled' | 'disabled';
  loading: boolean;
  onSearch: (search: string) => void;
  onStatusChange: (status: 'all' | 'enabled' | 'disabled') => void;
  onRefresh: () => void;
  selectedCount: number;
  removing: boolean;
  onDeleteSelected?: () => Promise<boolean>;
}

export function RouteToolbar({
  mode,
  deleteAction,
  search,
  status,
  loading,
  onSearch,
  onStatusChange,
  onRefresh,
  selectedCount,
  removing,
  onDeleteSelected,
}: RouteToolbarProps) {
  const t = useTranslations();

  return (
    <ListToolbar
      searchPlaceholder={t(`admin.routes.${mode}.searchPlaceholder`)}
      search={search}
      status={status}
      loading={loading}
      onSearch={onSearch}
      onStatusChange={onStatusChange}
      onRefresh={onRefresh}
      refreshDisabled={loading || removing}
      actions={
        selectedCount > 0 &&
        (deleteAction ??
          (onDeleteSelected && (
            <RouteDelete
              variant="destructive"
              label={t('shared.deleteSelected', { count: selectedCount })}
              description={t('admin.routes.shared.deleteSelectedConfirmation', { count: selectedCount })}
              disabled={loading || removing}
              onRemove={onDeleteSelected}
            />
          )))
      }
    />
  );
}
