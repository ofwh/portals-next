'use client';

import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { compileTargetOptions, isCompileTarget } from '@/lib/subscription/shared/compile';
import type { NodeFormProps } from '@/lib/workflow/node/types';
import type { CompileNodeConfig } from '../model/types';

function ConfigForm({ value, onChange, disabled, issues }: NodeFormProps<CompileNodeConfig>) {
  const t = useTranslations('workflowNodes.configuration.compile');
  const id = useId();
  const invalid = issues.some((issue) => issue.path[0] === 'target');

  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-6">
      <FieldGroup className="gap-1">
        <Field orientation="horizontal" className="min-w-0 gap-2" data-invalid={invalid || undefined}>
          <FieldContent>
            <FieldLabel htmlFor={`${id}-target`}>{t('target')}</FieldLabel>
            <FieldDescription id={`${id}-target-help`}>{t('targetHelp')}</FieldDescription>
          </FieldContent>
          <div data-slot="field-control">
            <Select
              value={isCompileTarget(value.target) ? value.target : null}
              required
              disabled={disabled}
              onValueChange={(target) => {
                if (isCompileTarget(target)) {
                  onChange({ target });
                }
              }}
            >
              <SelectTrigger
                id={`${id}-target`}
                aria-describedby={`${id}-target-help`}
                aria-invalid={invalid || undefined}
                className="w-full"
              >
                <SelectValue placeholder={t('targetPlaceholder')}>
                  {compileTargetOptions.find((option) => option.value === value.target)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent side="bottom" alignItemWithTrigger={false}>
                {compileTargetOptions.map(({ value: target, label }) => (
                  <SelectItem key={target} value={target}>
                    {label}
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
  const t = useTranslations('workflowNodes.configuration.compile');

  return { title: t('name'), description: t('description'), ConfigForm };
}
