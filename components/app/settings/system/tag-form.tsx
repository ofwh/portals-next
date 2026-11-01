'use client';

import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { RecentColorPicker } from '@/components/business/color-picker';
import { TagBadge } from '@/components/business/tag-badge';
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { TAG_GROUPS } from '@/lib/constants/tags';
import type { TagFormChange, TagInput } from '@/lib/types/tag';

export function TagForm({ form, onChange }: { form: TagInput; onChange: TagFormChange }) {
  const t = useTranslations();

  const id = useId();
  const groups = TAG_GROUPS.map((group) => ({ value: group.value, label: t(group.label) }));
  const items = [
    {
      key: 'label',
      label: t('shared.name'),
      content: (
        <Input
          id={`${id}-label`}
          required
          value={form.label}
          onChange={(event) => onChange('label', event.target.value)}
        />
      ),
    },
    {
      key: 'group',
      label: t('admin.settings.system.tags.shared.group'),
      content: (
        <Select
          value={form.group}
          items={groups}
          onValueChange={(value) => {
            if (value !== null) {
              onChange('group', value);
            }
          }}
        >
          <SelectTrigger id={`${id}-group`} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="bottom" alignItemWithTrigger={false}>
            {groups.map((group) => (
              <SelectItem key={group.value} value={group.value}>
                {group.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: 'color',
      label: t('admin.settings.system.tags.form.color'),
      content: (
        <RecentColorPicker
          id={`${id}-color`}
          label={t('admin.settings.system.tags.form.color')}
          value={form.color}
          onChange={(value) => onChange('color', value)}
        />
      ),
    },
    {
      key: 'bgColor',
      label: t('admin.settings.system.tags.form.bgColor'),
      content: (
        <RecentColorPicker
          id={`${id}-bgColor`}
          label={t('admin.settings.system.tags.form.bgColor')}
          value={form.bgColor}
          onChange={(value) => onChange('bgColor', value)}
        />
      ),
    },
    {
      key: 'rounded',
      label: t('admin.settings.system.tags.form.rounded'),
      content: (
        <Switch
          id={`${id}-rounded`}
          checked={form.rounded === 1}
          onCheckedChange={(checked) => onChange('rounded', checked ? 1 : 0)}
        />
      ),
    },
  ] as const;

  return (
    <FieldGroup className="gap-1">
      {items.map((item) => (
        <Field key={item.key} orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor={`${id}-${item.key}`}>{item.label}</FieldLabel>
          </FieldContent>
          <div data-slot="field-control">{item.content}</div>
        </Field>
      ))}
      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel>{t('admin.settings.system.tags.shared.preview')}</FieldLabel>
        </FieldContent>
        <div data-slot="field-control" className="min-h-12">
          <TagBadge
            tag={{ ...form, id: 'preview', label: form.label.trim() || t('admin.settings.system.tags.shared.preview') }}
          />
        </div>
      </Field>
    </FieldGroup>
  );
}
