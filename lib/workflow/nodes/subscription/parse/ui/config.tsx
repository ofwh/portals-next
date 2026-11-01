'use client';

import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { NodeFormProps } from '../../../types';
import { subscriptionFormatLabels, subscriptionFormats } from '../model/definition';
import { isSubscriptionFormat } from '../model/schema';
import type { ParseConfig } from '../model/types';

export function ParseForm({ value, onChange, disabled, issues }: NodeFormProps<ParseConfig>) {
  const t = useTranslations('workflowNodes.subscription');
  const id = useId();

  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`${id}-format`}>{t('parse.format')}</FieldLabel>
          <FieldDescription id={`${id}-help`}>{t('parse.help')}</FieldDescription>
          <Select
            value={value.format}
            disabled={disabled}
            onValueChange={(format) => {
              if (isSubscriptionFormat(format)) {
                onChange({ format });
              }
            }}
          >
            <SelectTrigger id={`${id}-format`} aria-describedby={`${id}-help`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="bottom" alignItemWithTrigger={false}>
              {subscriptionFormats.map((format) => (
                <SelectItem key={format} value={format}>
                  {t(`formats.${subscriptionFormatLabels[format]}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
