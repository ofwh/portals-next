'use client';
import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { NodeFormProps } from '../../../types';
import { formats } from '../model/definition';
import type { ContentExtractConfig } from '../model/types';

export function ContentExtractForm({ value, onChange, disabled }: NodeFormProps<ContentExtractConfig>) {
  const t = useTranslations('workflowNodes.subscription.contentExtract');
  const id = useId();

  return (
    <FieldGroup>
      <Field orientation="horizontal">
        <FieldContent>
          <FieldLabel htmlFor={id}>{t('format')}</FieldLabel>
          <FieldDescription id={`${id}-help`}>{t('help')}</FieldDescription>
        </FieldContent>
        <div data-slot="field-control">
          <Select
            value={value.format}
            disabled={disabled}
            onValueChange={(format) => {
              const selected = formats.find((item) => item === format);

              if (selected) {
                onChange({ format: selected });
              }
            }}
          >
            <SelectTrigger id={id} aria-describedby={`${id}-help`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="bottom" alignItemWithTrigger={false}>
              {formats.map((format) => (
                <SelectItem key={format} value={format}>
                  {format === 'loon' ? 'Loon' : format === 'clash' ? 'Clash / Mihomo' : format}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Field>
    </FieldGroup>
  );
}
