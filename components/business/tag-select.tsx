'use client';

import { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox';
import { useTagOptions } from '@/hooks/use-tag';
import { TagBadge, tagStyle } from './tag-badge';

export function TagSelect({
  id,
  group,
  value,
  onChange,
  descriptionId,
}: {
  id: string;
  group: string;
  value?: string[] | null;
  onChange: (ids: string[]) => void;
  descriptionId?: string;
}) {
  const t = useTranslations();

  const anchor = useComboboxAnchor();
  const { status, options, reload } = useTagOptions(group);
  const selected = value ?? [];
  const byId = new Map(options.map((tag) => [tag.id, tag]));

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <Combobox
        multiple
        items={options.map((tag) => tag.id)}
        value={selected}
        onValueChange={onChange}
        itemToStringLabel={(tagId) => byId.get(tagId)?.label ?? tagId}
        disabled={status !== 'ready'}
      >
        <ComboboxChips ref={anchor} className="w-full min-w-0">
          <ComboboxValue>
            {selected.map((tagId) => {
              const tag = byId.get(tagId);

              return (
                <ComboboxChip
                  key={tagId}
                  style={tag ? tagStyle(tag) : undefined}
                  showRemove={false}
                  className={tag?.rounded === 1 ? 'max-w-full rounded-full' : 'max-w-full rounded-sm'}
                >
                  <span className="truncate">{tag?.label ?? tagId}</span>
                  <ComboboxPrimitive.ChipRemove
                    data-slot="combobox-chip-remove"
                    aria-label={t('admin.settings.system.tags.shared.remove', { label: tag?.label ?? tagId })}
                    render={<Button type="button" variant="ghost" size="icon-xs" />}
                  >
                    <X className="size-3" />
                  </ComboboxPrimitive.ChipRemove>
                </ComboboxChip>
              );
            })}
          </ComboboxValue>
          <ComboboxChipsInput
            id={id}
            aria-describedby={descriptionId}
            aria-busy={status === 'loading'}
            placeholder={t(
              status === 'loading'
                ? 'admin.settings.system.tags.shared.loading'
                : 'admin.settings.system.tags.shared.placeholder',
            )}
          />
        </ComboboxChips>
        <ComboboxContent side="bottom" anchor={anchor}>
          <ComboboxEmpty>{t('admin.settings.system.tags.shared.empty')}</ComboboxEmpty>
          <ComboboxList>
            {(tagId: string) => {
              const tag = byId.get(tagId);

              return (
                <ComboboxItem key={tagId} value={tagId}>
                  {tag && <TagBadge tag={tag} />}
                </ComboboxItem>
              );
            }}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {status === 'error' && (
        <div className="flex items-center justify-between gap-2 text-sm">
          <span role="alert" className="text-destructive">
            {t('admin.settings.system.tags.shared.loadError')}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={reload}>
            {t('shared.retry')}
          </Button>
        </div>
      )}
    </div>
  );
}
