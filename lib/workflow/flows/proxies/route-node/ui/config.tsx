'use client';

import { Autocomplete } from '@base-ui/react/autocomplete';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useState } from 'react';
import { PasswordInput } from '@/components/business/password-input';
import { ComboboxContent, ComboboxEmpty, ComboboxList } from '@/components/ui/combobox';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { listCaches, listOriginals, listProxies, listRedirects } from '@/lib/client/routes';
import { ROUTE_MODE_OPTIONS } from '@/lib/constants/routes';
import type { RouteMode } from '@/lib/constants/routes';
import type { NodeFormProps } from '@/lib/workflow/node/types';
import type { RouteConfig } from '../model/types';

interface RouteOption {
  id: string;
  name: string;
  pathname: string;
}

const clients = { proxies: listProxies, redirects: listRedirects, caches: listCaches, originals: listOriginals };

function usePathnameOptions(mode: RouteMode, search: string, active: boolean) {
  const [state, setState] = useState<{ key: string; options: RouteOption[]; error: boolean } | null>(null);
  const key = JSON.stringify([mode, search]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      clients[mode]({ page: 1, size: 100, search, status: 'enabled' }, controller.signal).then(
        (result) => {
          if (!controller.signal.aborted) {
            setState({ key, options: result.data.filter((route) => route.status), error: false });
          }
        },
        () => {
          if (!controller.signal.aborted) {
            setState({ key, options: [], error: true });
          }
        },
      );
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [mode, search, active, key]);

  const current = state?.key === key ? state : null;

  return { options: current?.options ?? [], loading: active && !current, error: current?.error ?? false };
}

function ConfigForm({ value, onChange, disabled, issues }: NodeFormProps<RouteConfig>) {
  const t = useTranslations();
  const id = useId();
  const modes = ROUTE_MODE_OPTIONS.map((option) => ({ ...option, label: t(option.label) }));
  const [open, setOpen] = useState(false);
  const { options, loading, error } = usePathnameOptions(value.mode, value.pathname, open && !disabled);

  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-6">
      <FieldGroup className="gap-1">
        <Field orientation="horizontal" className="min-w-0 gap-2">
          <FieldContent>
            <FieldLabel htmlFor={`${id}-mode`}>{t('workflowNodes.proxy.route.mode')}</FieldLabel>
            <FieldDescription id={`${id}-mode-help`}>{t('workflowNodes.proxy.route.modeHelp')}</FieldDescription>
          </FieldContent>
          <div data-slot="field-control">
            <Select
              value={value.mode}
              items={modes}
              disabled={disabled}
              onValueChange={(mode) => {
                const option = ROUTE_MODE_OPTIONS.find((item) => item.value === mode);

                if (option) {
                  onChange({ ...value, mode: option.value });
                }
              }}
            >
              <SelectTrigger id={`${id}-mode`} aria-describedby={`${id}-mode-help`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="bottom" alignItemWithTrigger={false}>
                {modes.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Field>
        <Field orientation="horizontal" className="min-w-0 gap-2">
          <FieldContent>
            <FieldLabel htmlFor={`${id}-pathname`}>{t('workflowNodes.proxy.route.pathname')}</FieldLabel>
            <FieldDescription id={`${id}-pathname-help`}>
              {t('workflowNodes.proxy.route.pathnameHelp')}
            </FieldDescription>
          </FieldContent>
          <div data-slot="field-control">
            <div className="w-full min-w-0">
              <Autocomplete.Root
                items={options}
                value={value.pathname}
                onValueChange={(pathname) => onChange({ ...value, pathname })}
                itemToStringValue={(item) => item.pathname}
                filter={null}
                open={open && !disabled}
                onOpenChange={setOpen}
                disabled={disabled}
              >
                <Autocomplete.Input
                  render={<Input />}
                  id={`${id}-pathname`}
                  aria-describedby={`${id}-pathname-help`}
                  aria-busy={loading}
                  required
                  placeholder="/example/path"
                />
                <ComboboxContent side="bottom">
                  <ComboboxEmpty>
                    {t(
                      loading
                        ? 'workflowNodes.proxy.route.loading'
                        : error
                          ? 'workflowNodes.proxy.route.loadError'
                          : 'workflowNodes.proxy.route.empty',
                    )}
                  </ComboboxEmpty>
                  <ComboboxList>
                    {(item: (typeof options)[number]) => (
                      <Autocomplete.Item
                        key={item.id}
                        value={item}
                        className="data-highlighted:bg-accent data-highlighted:text-accent-foreground flex cursor-default flex-col gap-1 rounded-sm px-2 py-1.5 text-sm outline-hidden"
                      >
                        <span className="w-full truncate">{item.pathname}</span>
                        <span className="text-muted-foreground w-full truncate text-xs">{item.name}</span>
                      </Autocomplete.Item>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Autocomplete.Root>
            </div>
          </div>
        </Field>
        <Field orientation="horizontal" className="min-w-0 gap-2">
          <FieldContent>
            <FieldLabel htmlFor={`${id}-method`}>{t('workflowNodes.proxy.route.method')}</FieldLabel>
            <FieldDescription id={`${id}-method-help`}>{t('workflowNodes.proxy.route.methodHelp')}</FieldDescription>
          </FieldContent>
          <div data-slot="field-control">
            <Select
              value={value.method}
              disabled={disabled}
              onValueChange={(method) => {
                if (method === 'GET' || method === 'POST') {
                  onChange({ ...value, method });
                }
              }}
            >
              <SelectTrigger id={`${id}-method`} aria-describedby={`${id}-method-help`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="bottom" alignItemWithTrigger={false}>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Field>
        {value.method === 'POST' && (
          <Field orientation="horizontal" className="min-w-0 gap-2">
            <FieldContent>
              <FieldLabel htmlFor={`${id}-body`}>{t('workflowNodes.proxy.route.body')}</FieldLabel>
              <FieldDescription id={`${id}-body-help`}>{t('workflowNodes.proxy.route.bodyHelp')}</FieldDescription>
            </FieldContent>
            <div data-slot="field-control">
              <Textarea
                id={`${id}-body`}
                aria-describedby={`${id}-body-help`}
                className="min-h-32 resize-y font-mono"
                value={value.body}
                onChange={(event) => onChange({ ...value, body: event.target.value })}
              />
            </div>
          </Field>
        )}
        <Field orientation="horizontal" className="min-w-0 gap-2">
          <FieldContent>
            <FieldLabel htmlFor={`${id}-token`}>{t('workflowNodes.proxy.route.token')}</FieldLabel>
            <FieldDescription id={`${id}-token-help`}>{t('workflowNodes.proxy.route.tokenHelp')}</FieldDescription>
          </FieldContent>
          <div data-slot="field-control">
            <PasswordInput
              id={`${id}-token`}
              disabled={disabled}
              autoComplete="new-password"
              aria-describedby={`${id}-token-help`}
              value={value.token}
              onChange={(event) => onChange({ ...value, token: event.target.value })}
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

export function useNodeConfig() {
  const t = useTranslations('workflowNodes.proxy.route');

  return { title: t('name'), description: t('description'), ConfigForm };
}
