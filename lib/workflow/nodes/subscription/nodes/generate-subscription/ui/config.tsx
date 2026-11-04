'use client';

import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { Button } from '@/components/ui/button';
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from '@/components/ui/combobox';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import type { OutputTarget } from '@/lib/subconverter/output/types';
import type { NodeFormProps } from '@/lib/workflow/nodes/types';
import { outputFormatLabels, outputFormats } from '../model/definition';
import { isOutputFormat } from '../model/schema';
import type { GenerateSubscriptionConfig } from '../model/types';

export function GenerateSubscriptionForm({
  value,
  onChange,
  disabled,
  issues,
}: NodeFormProps<GenerateSubscriptionConfig>) {
  const t = useTranslations('workflowNodes.subscription.generateSubscription');
  const id = useId();

  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-6">
      <FieldGroup className="gap-1">
        <Field orientation="horizontal" className="min-w-0 gap-2">
          <FieldContent>
            <FieldLabel htmlFor={id}>{t('format')}</FieldLabel>
            <FieldDescription id={`${id}-description`}>{t('help')}</FieldDescription>
          </FieldContent>
          <div data-slot="field-control">
            <Combobox
              items={outputFormats}
              filter={null}
              value={value.format}
              disabled={disabled}
              itemToStringLabel={(format) => outputFormatLabels[format]}
              onValueChange={(format) => {
                if (isOutputFormat(format)) {
                  onChange({ format });
                }
              }}
            >
              <ComboboxTrigger
                id={id}
                type="button"
                aria-describedby={`${id}-description`}
                disabled={disabled}
                render={<Button variant="outline" className="w-full justify-between font-normal" />}
              >
                <ComboboxValue>{outputFormatLabels[value.format]}</ComboboxValue>
              </ComboboxTrigger>
              <ComboboxContent side="bottom" align="start">
                <ComboboxList>
                  {(format: OutputTarget) => (
                    <ComboboxItem key={format} value={format}>
                      {outputFormatLabels[format]}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
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
