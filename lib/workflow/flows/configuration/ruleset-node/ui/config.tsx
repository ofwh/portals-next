'use client';

import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { isRulesetTransformer, rulesetTransformerOptions } from '@/lib/subscription/ruleset/transformers/options';
import type { NodeFormProps } from '@/lib/workflow/node/types';
import { formatOptions } from '../model/definition';
import { getConfigTransformer, isFormat } from '../model/schema';
import type { RulesetResolveConfig } from '../model/types';

function ConfigForm({ value, onChange, disabled, issues }: NodeFormProps<RulesetResolveConfig>) {
  const t = useTranslations('workflowNodes.configuration');
  const id = useId();
  const transformer = getConfigTransformer(value);

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
              value={isFormat(value.format) ? value.format : null}
              required
              disabled={disabled}
              onValueChange={(format) => {
                if (isFormat(format)) {
                  onChange({ ...value, format });
                }
              }}
            >
              <SelectTrigger id={`${id}-format`} aria-describedby={`${id}-format-help`} className="w-full">
                <SelectValue placeholder={t('shared.formatPlaceholder')}>
                  {isFormat(value.format) ? value.format.toUpperCase() : undefined}
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
        <Field orientation="horizontal" className="min-w-0 gap-2">
          <FieldContent>
            <FieldLabel htmlFor={`${id}-transformer`}>{t('shared.resolver')}</FieldLabel>
            <FieldDescription id={`${id}-transformer-help`}>{t('ruleset.transformerHelp')}</FieldDescription>
          </FieldContent>
          <div data-slot="field-control">
            <Select
              value={transformer ?? null}
              required
              disabled={disabled}
              onValueChange={(transformer) => {
                if (isRulesetTransformer(transformer)) {
                  onChange({ format: value.format, transformer });
                }
              }}
            >
              <SelectTrigger id={`${id}-transformer`} aria-describedby={`${id}-transformer-help`} className="w-full">
                <SelectValue placeholder={t('shared.resolverPlaceholder')}>
                  {rulesetTransformerOptions.find((option) => option.value === transformer)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent side="bottom" alignItemWithTrigger={false}>
                {rulesetTransformerOptions.map(({ value: transformer, label }) => (
                  <SelectItem key={transformer} value={transformer}>
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
  const t = useTranslations('workflowNodes.configuration');

  return { title: t('ruleset.name'), description: t('ruleset.description'), ConfigForm };
}
