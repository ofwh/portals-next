'use client';

import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { NodeFormProps } from '../../../types';
import type { RenameConfig, RenameRule } from '../types';

export function RenameForm({ value, onChange, disabled, issues }: NodeFormProps<RenameConfig>) {
  const t = useTranslations('admin.application.subscriptions.flowEditor.subscriptionNodes.rename');
  const id = useId();

  function update(index: number, rule: RenameRule) {
    onChange({ rules: value.rules.map((current, position) => (position === index ? rule : current)) });
  }

  function move(index: number, offset: number) {
    const rules = [...value.rules];

    [rules[index], rules[index + offset]] = [rules[index + offset], rules[index]];
    onChange({ rules });
  }

  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-6">
      <FieldGroup>
        <Field>
          <div className="flex items-center justify-between gap-3">
            <FieldLabel id={`${id}-rules`}>{t('rules')}</FieldLabel>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    disabled={disabled}
                    aria-label={t('add')}
                    onClick={() =>
                      onChange({
                        rules: [...value.rules, { id: crypto.randomUUID(), pattern: '', replacement: '' }],
                      })
                    }
                  />
                }
              >
                <Plus />
              </TooltipTrigger>
              <TooltipContent side="top">{t('add')}</TooltipContent>
            </Tooltip>
          </div>
          <div role="group" aria-labelledby={`${id}-rules`} className="min-w-0 space-y-3">
            {value.rules.map((rule, index) => (
              <div key={rule.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2">
                <Input
                  aria-label={t('pattern')}
                  placeholder={t('pattern')}
                  value={rule.pattern}
                  onChange={(event) => update(index, { ...rule, pattern: event.target.value })}
                />
                <Input
                  aria-label={t('replacement')}
                  placeholder={t('replacement')}
                  value={rule.replacement}
                  onChange={(event) => update(index, { ...rule, replacement: event.target.value })}
                />
                <div className="flex gap-1">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={disabled || index === 0}
                          aria-label={t('moveUp')}
                          onClick={() => move(index, -1)}
                        />
                      }
                    >
                      <ArrowUp />
                    </TooltipTrigger>
                    <TooltipContent side="top">{t('moveUp')}</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={disabled || index === value.rules.length - 1}
                          aria-label={t('moveDown')}
                          onClick={() => move(index, 1)}
                        />
                      }
                    >
                      <ArrowDown />
                    </TooltipTrigger>
                    <TooltipContent side="top">{t('moveDown')}</TooltipContent>
                  </Tooltip>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    disabled={disabled}
                    aria-label={t('remove')}
                    onClick={() => onChange({ rules: value.rules.filter((_, position) => position !== index) })}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
            ))}
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
