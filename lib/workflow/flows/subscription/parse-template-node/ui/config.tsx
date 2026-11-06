'use client';

import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { NodeFormProps } from '@/lib/workflow/node/types';
import { templateFormatLabels, templateFormats } from '../model/definition';
import { isTemplateFormat } from '../model/schema';
import type { ParseTemplateConfig } from '../model/types';

export function ParseTemplateForm({ value, onChange, disabled, issues }: NodeFormProps<ParseTemplateConfig>) {
  const t = useTranslations('workflowNodes.subscription');
  const id = useId();

  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-6">
      <FieldGroup className="gap-1">
        <Field orientation="horizontal" className="min-w-0 gap-2">
          <FieldContent>
            <FieldLabel htmlFor={`${id}-format`}>{t('parseTemplate.format')}</FieldLabel>
            <FieldDescription id={`${id}-help`}>{t('parseTemplate.help')}</FieldDescription>
          </FieldContent>
          <div data-slot="field-control">
            <Select
              value={value.format}
              disabled={disabled}
              onValueChange={(format) => {
                if (isTemplateFormat(format)) {
                  onChange({ format });
                }
              }}
            >
              <SelectTrigger id={`${id}-format`} aria-describedby={`${id}-help`} className="w-full">
                <SelectValue>{templateFormatLabels[value.format]}</SelectValue>
              </SelectTrigger>
              <SelectContent side="bottom" alignItemWithTrigger={false}>
                {templateFormats.map((format) => (
                  <SelectItem key={format} value={format}>
                    {templateFormatLabels[format]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
