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
import type { ConfigType } from '@/lib/subconverter/configuration/types';
import { configurationTypes, isConfigurationType } from '@/lib/workflow/nodes/configuration/utils/configuration';
import type { ConfigIssue } from '@/lib/workflow/nodes/types';

interface ConfigurationTypeFormProps {
  value: ConfigType;
  onChange(type: ConfigType): void;
  disabled: boolean;
  issues: readonly ConfigIssue[];
}

export function ConfigurationTypeForm({ value, onChange, disabled, issues }: ConfigurationTypeFormProps) {
  const t = useTranslations('workflowNodes.configuration.shared');
  const id = useId();

  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-6">
      <FieldGroup className="gap-1">
        <Field orientation="horizontal" className="min-w-0 gap-2">
          <FieldContent>
            <FieldLabel htmlFor={id}>{t('type')}</FieldLabel>
            <FieldDescription id={`${id}-description`}>{t('typeHelp')}</FieldDescription>
          </FieldContent>
          <div data-slot="field-control">
            <Combobox
              items={configurationTypes}
              filter={null}
              value={value}
              disabled={disabled}
              itemToStringLabel={(type) => type.toUpperCase()}
              onValueChange={(type) => {
                if (isConfigurationType(type)) {
                  onChange(type);
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
                <ComboboxValue>{value.toUpperCase()}</ComboboxValue>
              </ComboboxTrigger>
              <ComboboxContent side="bottom" align="start">
                <ComboboxList>
                  {(type: ConfigType) => (
                    <ComboboxItem key={type} value={type}>
                      {type.toUpperCase()}
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
