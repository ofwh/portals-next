'use client';

import { CircleHelp, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { Button } from '@/components/ui/button';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox';
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { NodeFormProps } from '../../../types';
import type { SubscriptionProtocol } from '../../types';
import { protocolOptions } from '../definition';
import { getNameRules, isProtocol } from '../schema';
import type { FilterConfig } from '../types';

export function FilterForm({ value, onChange, disabled, issues }: NodeFormProps<FilterConfig>) {
  const t = useTranslations('admin.application.subscriptions.flowEditor.subscriptionNodes.filter');
  const id = useId();
  const anchor = useComboboxAnchor();
  const rules = getNameRules(value);
  const protocols = Object.keys(protocolOptions).filter(isProtocol);

  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-6">
      <FieldGroup>
        <Field orientation="horizontal" className="min-w-0 gap-2">
          <FieldContent>
            <FieldLabel id={`${id}-protocols`}>{t('protocols')}</FieldLabel>
          </FieldContent>
          <div data-slot="field-control">
            <Combobox
              multiple
              items={protocols}
              value={value.protocols}
              disabled={disabled}
              itemToStringLabel={(protocol) => protocolOptions[protocol]}
              onValueChange={(protocols) => onChange({ ...value, protocols })}
            >
              <ComboboxChips ref={anchor} className="relative w-full min-w-0 pr-9 has-data-[slot=combobox-chip]:pr-9">
                <ComboboxValue>
                  {value.protocols.map((protocol) => (
                    <ComboboxChip key={protocol}>{protocolOptions[protocol]}</ComboboxChip>
                  ))}
                </ComboboxValue>
                <ComboboxChipsInput aria-labelledby={`${id}-protocols`} placeholder={t('protocolsPlaceholder')} />
                <ComboboxTrigger
                  type="button"
                  disabled={disabled}
                  aria-label={t('protocols')}
                  className="focus-visible:ring-ring absolute top-1/2 right-2 flex size-5 -translate-y-1/2 items-center justify-center rounded-sm outline-none focus-visible:ring-2"
                />
              </ComboboxChips>
              <ComboboxContent side="bottom" anchor={anchor}>
                <ComboboxEmpty>{t('noProtocols')}</ComboboxEmpty>
                <ComboboxList>
                  {(protocol: SubscriptionProtocol) => (
                    <ComboboxItem key={protocol} value={protocol}>
                      {protocolOptions[protocol]}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
        </Field>
        <Field>
          <div className="flex items-center justify-between gap-3">
            <FieldLabel id={`${id}-patterns`}>{t('namePattern')}</FieldLabel>
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
                      onChange({ ...value, namePattern: [...rules, { id: crypto.randomUUID(), pattern: '' }] })
                    }
                  />
                }
              >
                <Plus />
              </TooltipTrigger>
              <TooltipContent side="top">{t('add')}</TooltipContent>
            </Tooltip>
          </div>
          <div role="group" aria-labelledby={`${id}-patterns`} className="min-w-0 space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                <Input
                  aria-label={t('pattern')}
                  placeholder={t('pattern')}
                  value={rule.pattern}
                  onChange={(event) =>
                    onChange({
                      ...value,
                      namePattern: rules.map((current) =>
                        current.id === rule.id ? { ...current, pattern: event.target.value } : current,
                      ),
                    })
                  }
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  disabled={disabled}
                  aria-label={t('remove')}
                  onClick={() => onChange({ ...value, namePattern: rules.filter((current) => current.id !== rule.id) })}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        </Field>
        <Field orientation="horizontal">
          <FieldContent>
            <div className="flex items-center gap-1.5">
              <FieldLabel htmlFor={`${id}-exclude`}>{t('exclude')}</FieldLabel>
              <Tooltip>
                <TooltipTrigger
                  aria-label={t('excludeHelp')}
                  render={<Button type="button" variant="ghost" size="icon-xs" className="text-muted-foreground" />}
                >
                  <CircleHelp />
                </TooltipTrigger>
                <TooltipContent side="top" className="w-auto max-w-none">
                  <p className="whitespace-nowrap">{t('excludeOffHelp')}</p>
                  <p className="whitespace-nowrap">{t('excludeOnHelp')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </FieldContent>
          <div data-slot="field-control">
            <Switch
              id={`${id}-exclude`}
              disabled={disabled}
              checked={value.exclude}
              onCheckedChange={(checked) => onChange({ ...value, exclude: checked })}
            />
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
