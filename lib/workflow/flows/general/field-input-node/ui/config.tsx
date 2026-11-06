'use client';

import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { NodeFormProps } from '@/lib/workflow/node/types';
import { isOutputFormat } from '../model/schema';
import type { FieldInputConfig } from '../model/types';

export function FieldInputForm({ value, onChange, disabled, issues }: NodeFormProps<FieldInputConfig>) {
  const t = useTranslations('workflowNodes.common');
  const id = useId();

  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-6">
      <FieldGroup className="gap-1">
        <Field orientation="horizontal" className="min-w-0 gap-2">
          <FieldContent>
            <FieldLabel htmlFor={`${id}-format`}>{t('fieldInput.outputFormat')}</FieldLabel>
            <FieldDescription id={`${id}-format-help`}>{t('fieldInput.outputFormatHelp')}</FieldDescription>
          </FieldContent>
          <div data-slot="field-control">
            <Select
              value={value.outputFormat}
              disabled={disabled}
              onValueChange={(outputFormat) => {
                if (isOutputFormat(outputFormat)) {
                  onChange({ ...value, outputFormat });
                }
              }}
            >
              <SelectTrigger id={`${id}-format`} aria-describedby={`${id}-format-help`} className="w-full">
                <SelectValue>
                  {t(value.outputFormat === 'String' ? 'shared.formats.text' : 'shared.formats.json')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent side="bottom" alignItemWithTrigger={false}>
                <SelectItem value="String">{t('shared.formats.text')}</SelectItem>
                <SelectItem value="Object">{t('shared.formats.json')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Field>
        <Field orientation="horizontal" className="min-w-0 gap-2">
          <FieldContent>
            <FieldLabel htmlFor={`${id}-text`}>{t('fieldInput.text')}</FieldLabel>
            <FieldDescription id={`${id}-help`}>{t('fieldInput.help')}</FieldDescription>
          </FieldContent>
          <div data-slot="field-control">
            <Textarea
              id={`${id}-text`}
              aria-describedby={`${id}-help`}
              className="min-h-64 resize-y font-mono"
              value={value.text}
              onChange={(event) => onChange({ ...value, text: event.target.value })}
            />
          </div>
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
