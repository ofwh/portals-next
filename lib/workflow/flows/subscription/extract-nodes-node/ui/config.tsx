'use client';

import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { NodeFormProps } from '@/lib/workflow/node/types';
import { subscriptionFormatLabels, subscriptionFormats } from '../model/definition';
import { isSubscriptionFormat } from '../model/schema';
import type { ExtractNodesConfig } from '../model/types';

export function ExtractNodesForm({ value, onChange, disabled, issues }: NodeFormProps<ExtractNodesConfig>) {
  const t = useTranslations('workflowNodes.subscription');
  const id = useId();

  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-6">
      <FieldGroup className="gap-1">
        <Field orientation="horizontal" className="min-w-0 gap-2">
          <FieldContent>
            <FieldLabel htmlFor={`${id}-format`}>{t('extractNodes.format')}</FieldLabel>
            <FieldDescription id={`${id}-help`}>{t('extractNodes.help')}</FieldDescription>
          </FieldContent>
          <div data-slot="field-control">
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
                <SelectValue>{t(`extractNodes.formats.${subscriptionFormatLabels[value.format]}`)}</SelectValue>
              </SelectTrigger>
              <SelectContent side="bottom" alignItemWithTrigger={false}>
                {subscriptionFormats.map((format) => (
                  <SelectItem key={format} value={format}>
                    {t(`extractNodes.formats.${subscriptionFormatLabels[format]}`)}
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
