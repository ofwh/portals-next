'use client';

import { RefreshCw, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface ListToolbarProps {
  searchPlaceholder: string;
  actions?: ReactNode;
  search: string;
  status: 'all' | 'enabled' | 'disabled';
  loading: boolean;
  onSearch: (search: string) => void;
  onStatusChange: (status: 'all' | 'enabled' | 'disabled') => void;
  onRefresh: () => void;
  refreshDisabled: boolean;
}

export function ListToolbar({
  searchPlaceholder,
  actions,
  search,
  status,
  loading,
  onSearch,
  onStatusChange,
  onRefresh,
  refreshDisabled,
}: ListToolbarProps) {
  const t = useTranslations();

  const [searchInput, setSearchInput] = useState(search);
  const statuses = [
    { value: 'all', label: t('shared.allStatuses') },
    { value: 'enabled', label: t('shared.enabled') },
    { value: 'disabled', label: t('shared.disabled') },
  ];

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch(searchInput.trim());
        }}
      >
        <div className="relative w-full sm:w-80">
          <Input
            className="pr-10"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon-sm"
            className="absolute top-1/2 right-0.5 -translate-y-1/2"
            aria-label={t('shared.search')}
          >
            <Search />
          </Button>
        </div>
        <Select
          value={status}
          items={statuses}
          onValueChange={(value) => {
            if (value === 'all' || value === 'enabled' || value === 'disabled') {
              onStatusChange(value);
            }
          }}
        >
          <SelectTrigger className="w-full sm:w-36" aria-label={t('shared.status')}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="bottom" alignItemWithTrigger={false}>
            {statuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </form>
      <div className="flex items-center gap-2">
        {actions}
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                disabled={refreshDisabled}
                onClick={onRefresh}
                aria-label={t('shared.refresh')}
              />
            }
          >
            <RefreshCw className={loading ? 'animate-spin' : undefined} />
          </TooltipTrigger>
          <TooltipContent side="top">{t('shared.refresh')}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
