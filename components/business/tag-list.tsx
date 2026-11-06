'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { TagOption } from '@/lib/types/tag';
import { TagBadge } from './tag-badge';

export function TagList({ tags }: { tags?: readonly TagOption[] | null }) {
  const t = useTranslations('admin.settings.system.tags.shared');
  const items = tags ?? [];
  const visible = items.length > 2 ? items.slice(0, 1) : items;
  const remaining = items.length > 2 ? items.slice(1) : [];

  if (!items.length) {
    return null;
  }

  return (
    <div className="flex max-w-56 items-center gap-1.5">
      {visible.map((tag) => (
        <span key={tag.id} className="min-w-0">
          <TagBadge tag={tag} />
        </span>
      ))}
      {remaining.length > 0 && (
        <Popover>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-5 shrink-0 rounded-full px-1.5 text-xs"
                aria-label={t('more', { count: remaining.length })}
              />
            }
          >
            +{remaining.length}
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="center"
            className="w-max max-w-[min(24rem,calc(100vw-2rem))] p-3"
            aria-label={t('more', { count: remaining.length })}
          >
            <div className="flex flex-wrap items-center gap-1.5">
              {remaining.map((tag) => (
                <TagBadge key={tag.id} tag={tag} />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
