'use client';

import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getRulesetResolver, isRulesetResolver, rulesetResolverOptions } from '@/lib/subscription/shared/ruleset';
import type { NodeFormProps } from '@/lib/workflow/node/types';
import { formatOptions } from '../model/definition';
import { isFormat } from '../model/schema';
import type { RulesetResolveConfig } from '../model/types';

function ConfigForm({ value, onChange, disabled, issues }: NodeFormProps<RulesetResolveConfig>) {
  const t = useTranslations('workflowNodes.configuration.ruleset');
  const id = useId();
  const resolver = getRulesetResolver(value.resolver);

  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-6">
      <FieldGroup className="gap-1">
        <Field orientation="horizontal" className="min-w-0 gap-2">
          <FieldContent>
            <FieldLabel htmlFor={`${id}-format`}>{t('format')}</FieldLabel>
            <FieldDescription id={`${id}-format-help`}>{t('formatHelp')}</FieldDescription>
          </FieldContent>
          <div data-slot="field-control">
            <Select
              value={isFormat(value.format) ? value.format : null}
              required
              disabled={disabled}
              onValueChange={(format) => {
                if (isFormat(format)) {
                  onChange({ ...value, format, resolver: resolver ?? '' });
                }
              }}
            >
              <SelectTrigger id={`${id}-format`} aria-describedby={`${id}-format-help`} className="w-full">
                <SelectValue placeholder={t('formatPlaceholder')}>
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
            <FieldLabel htmlFor={`${id}-resolver`}>{t('resolver')}</FieldLabel>
            <FieldDescription id={`${id}-resolver-help`}>{t('resolverHelp')}</FieldDescription>
          </FieldContent>
          <div data-slot="field-control">
            <Select
              value={resolver ?? null}
              required
              disabled={disabled}
              onValueChange={(resolver) => {
                if (isRulesetResolver(resolver)) {
                  onChange({ ...value, resolver });
                }
              }}
            >
              <SelectTrigger id={`${id}-resolver`} aria-describedby={`${id}-resolver-help`} className="w-full">
                <SelectValue placeholder={t('resolverPlaceholder')}>
                  {resolver ? rulesetResolverOptions[resolver] : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent side="bottom" alignItemWithTrigger={false}>
                {Object.entries(rulesetResolverOptions).map(([resolver, label]) => (
                  <SelectItem key={resolver} value={resolver}>
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
  const t = useTranslations('workflowNodes.configuration.ruleset');

  return { title: t('name'), description: t('description'), ConfigForm };
}
