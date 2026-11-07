'use client';

import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { isTemplateFormat } from '@/lib/subscription/shared/template';
import type { NodeFormProps } from '@/lib/workflow/node/types';
import { formatOptions } from '../model/definition';
import type { TemplateResolveConfig } from '../model/types';

function ConfigForm({ value, onChange, disabled, issues }: NodeFormProps<TemplateResolveConfig>) {
  const t = useTranslations('workflowNodes.configuration');
  const id = useId();

  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-6">
      <FieldGroup className="gap-1">
        <Field orientation="horizontal" className="min-w-0 gap-2">
          <FieldContent>
            <FieldLabel htmlFor={`${id}-format`}>{t('shared.format')}</FieldLabel>
            <FieldDescription id={`${id}-format-help`}>{t('shared.formatHelp')}</FieldDescription>
          </FieldContent>
          <div data-slot="field-control">
            <Select
              value={isTemplateFormat(value.format) ? value.format : null}
              required
              disabled={disabled}
              onValueChange={(format) => {
                if (isTemplateFormat(format)) {
                  onChange({ ...value, format });
                }
              }}
            >
              <SelectTrigger id={`${id}-format`} aria-describedby={`${id}-format-help`} className="w-full">
                <SelectValue placeholder={t('shared.formatPlaceholder')}>
                  {isTemplateFormat(value.format) ? value.format.toUpperCase() : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent side="bottom" alignItemWithTrigger={false}>
                {formatOptions.map((format) => (
                  <SelectItem key={format} value={format}>
                    {format.toUpperCase()}
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

export function useNodeConfig() {
  const t = useTranslations('workflowNodes.configuration');

  return { title: t('template.name'), description: t('template.description'), ConfigForm };
}
