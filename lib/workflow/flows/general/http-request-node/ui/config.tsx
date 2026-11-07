'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { NodeFormProps } from '@/lib/workflow/node/types';
import type { HttpRequestConfig } from '../model/types';

function ConfigForm({ value, onChange, disabled, issues }: NodeFormProps<HttpRequestConfig>) {
  const t = useTranslations('workflowNodes.common.httpRequest');
  const id = useId();

  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-6">
      <FieldGroup className="gap-1">
        <Field orientation="horizontal" className="min-w-0 gap-2">
          <FieldContent>
            <FieldLabel htmlFor={`${id}-method`}>{t('method')}</FieldLabel>
            <FieldDescription id={`${id}-method-help`}>{t('methodHelp')}</FieldDescription>
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
        <Field orientation="horizontal" className="min-w-0 gap-2">
          <FieldContent>
            <FieldLabel htmlFor={`${id}-url`}>{t('url')}</FieldLabel>
            <FieldDescription id={`${id}-url-help`}>{t('urlHelp')}</FieldDescription>
          </FieldContent>
          <div data-slot="field-control">
            <Input
              id={`${id}-url`}
              aria-describedby={`${id}-url-help`}
              type="url"
              required
              placeholder="https://example.com"
              value={value.url}
              onChange={(event) => onChange({ ...value, url: event.target.value })}
            />
          </div>
        </Field>
        <Field>
          <div className="flex items-center justify-between gap-3">
            <FieldContent>
              <FieldLabel id={`${id}-headers`}>{t('headers')}</FieldLabel>
              <FieldDescription id={`${id}-headers-help`}>{t('headersHelp')}</FieldDescription>
            </FieldContent>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    disabled={disabled}
                    aria-label={t('addHeader')}
                    onClick={() =>
                      onChange({
                        ...value,
                        headers: [...value.headers, { id: crypto.randomUUID(), name: '', value: '' }],
                      })
                    }
                  />
                }
              >
                <Plus />
              </TooltipTrigger>
              <TooltipContent side="top">{t('addHeader')}</TooltipContent>
            </Tooltip>
          </div>
          <div
            role="group"
            aria-labelledby={`${id}-headers`}
            aria-describedby={`${id}-headers-help`}
            className="min-w-0 space-y-3"
          >
            {value.headers.map((header) => (
              <div key={header.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2">
                <Input
                  aria-label={t('headerName')}
                  placeholder={t('headerName')}
                  value={header.name}
                  onChange={(event) =>
                    onChange({
                      ...value,
                      headers: value.headers.map((row) =>
                        row.id === header.id ? { ...row, name: event.target.value } : row,
                      ),
                    })
                  }
                />
                <Input
                  aria-label={t('headerValue')}
                  placeholder={t('headerValue')}
                  value={header.value}
                  onChange={(event) =>
                    onChange({
                      ...value,
                      headers: value.headers.map((row) =>
                        row.id === header.id ? { ...row, value: event.target.value } : row,
                      ),
                    })
                  }
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  aria-label={t('removeHeader')}
                  onClick={() => onChange({ ...value, headers: value.headers.filter((row) => row.id !== header.id) })}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        </Field>
        {value.method === 'POST' && (
          <Field orientation="horizontal" className="min-w-0 gap-2">
            <FieldContent>
              <FieldLabel htmlFor={`${id}-body`}>{t('body')}</FieldLabel>
              <FieldDescription id={`${id}-body-help`}>{t('bodyHelp')}</FieldDescription>
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
  const t = useTranslations('workflowNodes.common.httpRequest');

  return { title: t('name'), description: t('description'), ConfigForm };
}
