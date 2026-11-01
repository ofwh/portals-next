'use client';

import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { NodeFormProps } from '../../../types';
import { isMode } from '../model/schema';
import type { Base64Config } from '../model/types';

export function Base64Form({ value, onChange, disabled, issues }: NodeFormProps<Base64Config>) {
  const t = useTranslations('workflowNodes.common.base64');
  const id = useId();

  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-6">
      <FieldGroup>
        <Field>
          <FieldLabel id={`${id}-mode`}>{t('mode')}</FieldLabel>
          <FieldDescription id={`${id}-help`}>{t('help')}</FieldDescription>
          <Tabs
            value={value.mode}
            onValueChange={(mode) => {
              if (isMode(mode)) {
                onChange({ ...value, mode });
              }
            }}
          >
            <TabsList aria-labelledby={`${id}-mode`} aria-describedby={`${id}-help`}>
              <TabsTrigger value="encode" disabled={disabled}>
                {t('encode')}
              </TabsTrigger>
              <TabsTrigger value="decode" disabled={disabled}>
                {t('decode')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
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
