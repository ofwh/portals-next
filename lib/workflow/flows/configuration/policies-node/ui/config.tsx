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
import {
  configurationClients,
  configurationTypes,
  isConfigurationClient,
  isConfigurationType,
} from '@/lib/subconverter/configuration/options';
import type { ConfigurationClient } from '@/lib/subconverter/configuration/options';
import type { ConfigType } from '@/lib/subconverter/types/configuration';
import type { NodeFormProps } from '@/lib/workflow/node/types';
import type { PolicyGroupsConfig } from '../model/types';

export function PolicyGroupsForm({ value, onChange, disabled, issues }: NodeFormProps<PolicyGroupsConfig>) {
  const t = useTranslations('workflowNodes.configuration');
  const id = useId();
  const typeId = `${id}-type`;
  const clientId = `${id}-client`;
  const type = value.type ?? 'ini';
  const selectedClient = value.client ?? 'clash';
  const client = isConfigurationClient(selectedClient) ? selectedClient : null;
  const clientLabel = (item: ConfigurationClient) => t(`shared.clients.${item}`);

  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-6">
      <FieldGroup className="gap-1">
        <Field orientation="horizontal" className="min-w-0 gap-2">
          <FieldContent>
            <FieldLabel htmlFor={typeId}>{t('shared.type')}</FieldLabel>
            <FieldDescription id={`${typeId}-description`}>{t('shared.typeHelp')}</FieldDescription>
          </FieldContent>
          <div data-slot="field-control">
            <Combobox
              items={configurationTypes}
              filter={null}
              value={type}
              disabled={disabled}
              itemToStringLabel={(item) => item.toUpperCase()}
              onValueChange={(item) => {
                if (isConfigurationType(item)) {
                  onChange({ ...value, type: item });
                }
              }}
            >
              <ComboboxTrigger
                id={typeId}
                type="button"
                aria-describedby={`${typeId}-description`}
                disabled={disabled}
                render={<Button variant="outline" className="w-full justify-between font-normal" />}
              >
                <ComboboxValue>{type.toUpperCase()}</ComboboxValue>
              </ComboboxTrigger>
              <ComboboxContent side="bottom" align="start">
                <ComboboxList>
                  {(item: ConfigType) => (
                    <ComboboxItem key={item} value={item}>
                      {item.toUpperCase()}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
        </Field>
        <Field orientation="horizontal" className="min-w-0 gap-2">
          <FieldContent>
            <FieldLabel htmlFor={clientId}>{t('policyGroups.client')}</FieldLabel>
            <FieldDescription id={`${clientId}-description`}>
              {client === null ? t('shared.invalidClient', { client: selectedClient }) : t('shared.clientHelp')}
            </FieldDescription>
          </FieldContent>
          <div data-slot="field-control">
            <Combobox
              items={configurationClients}
              filter={null}
              value={client}
              disabled={disabled}
              itemToStringLabel={clientLabel}
              onValueChange={(item) => {
                if (isConfigurationClient(item)) {
                  onChange({ ...value, client: item });
                }
              }}
            >
              <ComboboxTrigger
                id={clientId}
                aria-invalid={client === null}
                type="button"
                aria-describedby={`${clientId}-description`}
                disabled={disabled}
                render={<Button variant="outline" className="w-full justify-between font-normal" />}
              >
                <ComboboxValue>{client === null ? t('shared.selectClient') : clientLabel(client)}</ComboboxValue>
              </ComboboxTrigger>
              <ComboboxContent side="bottom" align="start">
                <ComboboxList>
                  {(item: ConfigurationClient) => (
                    <ComboboxItem key={item} value={item}>
                      {clientLabel(item)}
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
