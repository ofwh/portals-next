'use client';

import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { NodeFormProps } from '../../../types';
import { isOutputFormat } from '../../schema';
import type { TextareaConfig } from '../types';

export function TextareaForm({ value, onChange, disabled, issues }: NodeFormProps<TextareaConfig>) {
  const t = useTranslations('admin.application.subscriptions.flowEditor.commonNodes');
  const id = useId();

  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`${id}-format`}>{t('textarea.outputFormat')}</FieldLabel>
          <Select
            value={value.outputFormat}
            disabled={disabled}
            onValueChange={(outputFormat) => {
              if (isOutputFormat(outputFormat)) {
                onChange({ ...value, outputFormat });
              }
            }}
          >
            <SelectTrigger id={`${id}-format`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="bottom" alignItemWithTrigger={false}>
              <SelectItem value="TEXT">{t('shared.formats.text')}</SelectItem>
              <SelectItem value="JSON">{t('shared.formats.json')}</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-text`}>{t('textarea.text')}</FieldLabel>
          <FieldDescription id={`${id}-help`}>{t('textarea.help')}</FieldDescription>
          <Textarea
            id={`${id}-text`}
            aria-describedby={`${id}-help`}
            className="min-h-64 resize-y font-mono"
            value={value.text}
            onChange={(event) => onChange({ ...value, text: event.target.value })}
          />
        </Field>
      </FieldGroup>
      {issues.length > 0 && (
        <div role="alert" className="text-destructive text-sm">
          {issues.map((issue) => (
            <p key={JSON.stringify([issue.path, issue.message])}>{issue.message}</p>
          ))}
        </div>
      )}
    </fieldset>
  );
}
