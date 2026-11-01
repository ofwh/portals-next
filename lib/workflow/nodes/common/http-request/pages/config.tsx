'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { NodeFormProps } from '../../../types';
import { isOutputFormat } from '../../schema';
import type { HttpRequestConfig } from '../types';

export function HttpRequestForm({ value, onChange, disabled, issues }: NodeFormProps<HttpRequestConfig>) {
  const t = useTranslations('admin.application.subscriptions.flowEditor.commonNodes');
  const id = useId();

  return (
    <fieldset disabled={disabled} className="min-w-0 space-y-6">
      <FieldGroup>
        <Field orientation="horizontal" className="min-w-0 gap-2">
          <FieldContent>
            <FieldLabel htmlFor={`${id}-method`}>{t('httpRequest.method')}</FieldLabel>
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
              <SelectTrigger id={`${id}-method`} className="w-full">
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
            <FieldLabel htmlFor={`${id}-url`}>{t('httpRequest.url')}</FieldLabel>
          </FieldContent>
          <div data-slot="field-control">
            <Input
              id={`${id}-url`}
              type="url"
              required
              placeholder="https://example.com"
              value={value.url}
              onChange={(event) => onChange({ ...value, url: event.target.value })}
            />
          </div>
        </Field>
        <Field orientation="horizontal" className="min-w-0 gap-2">
          <FieldContent>
            <FieldLabel id={`${id}-headers`}>{t('httpRequest.headers')}</FieldLabel>
          </FieldContent>
          <div data-slot="field-control">
            <div className="flex w-full min-w-0 flex-col gap-3">
              <div className="flex justify-end">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        disabled={disabled}
                        aria-label={t('httpRequest.addHeader')}
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
                  <TooltipContent side="top">{t('httpRequest.addHeader')}</TooltipContent>
                </Tooltip>
              </div>
              <div role="group" aria-labelledby={`${id}-headers`} className="min-w-0 space-y-3">
                {value.headers.map((header) => (
                  <div key={header.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2">
                    <Input
                      aria-label={t('httpRequest.headerName')}
                      placeholder={t('httpRequest.headerName')}
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
                      aria-label={t('httpRequest.headerValue')}
                      placeholder={t('httpRequest.headerValue')}
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
                      aria-label={t('httpRequest.removeHeader')}
                      onClick={() =>
                        onChange({ ...value, headers: value.headers.filter((row) => row.id !== header.id) })
                      }
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Field>
        {value.method === 'POST' && (
          <Field orientation="horizontal" className="min-w-0 gap-2">
            <FieldContent>
              <FieldLabel htmlFor={`${id}-body`}>{t('httpRequest.body')}</FieldLabel>
            </FieldContent>
            <div data-slot="field-control">
              <Textarea
                id={`${id}-body`}
                className="min-h-32 resize-y font-mono"
                value={value.body}
                onChange={(event) => onChange({ ...value, body: event.target.value })}
              />
            </div>
          </Field>
        )}
        <Field orientation="horizontal" className="min-w-0 gap-2">
          <FieldContent>
            <FieldLabel htmlFor={`${id}-format`}>{t('httpRequest.outputFormat')}</FieldLabel>
          </FieldContent>
          <div data-slot="field-control">
            <Select
              value={value.outputFormat}
              disabled={disabled}
              onValueChange={(outputFormat) => {
                if (isOutputFormat(outputFormat)) {
                  onChange({ ...value, outputFormat });
                }
              }}
            >
              <SelectTrigger id={`${id}-format`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent side="bottom" alignItemWithTrigger={false}>
                <SelectItem value="TEXT">{t('shared.formats.text')}</SelectItem>
                <SelectItem value="JSON">{t('shared.formats.json')}</SelectItem>
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
