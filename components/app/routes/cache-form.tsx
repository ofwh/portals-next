'use client';

import { addDays, format } from 'date-fns';
import { CalendarIcon, Clock2, Eye, EyeOff } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { type ReactNode, useId, useState } from 'react';
import { enUS, zhCN } from 'react-day-picker/locale';
import { RequestHeaders } from '@/components/business/request-headers';
import { TagSelect } from '@/components/business/tag-select';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Calendar } from '@/components/ui/calendar';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ROUTE_TYPE } from '@/lib/constants';
import type { CacheFormChange, CacheFormState } from '@/lib/types/routes';

interface FormItem {
  key: string;
  label: ReactNode;
  description?: ReactNode;
  htmlFor?: string;
  labelId?: string;
  descriptionId?: string;
  required?: boolean;
  content: ReactNode;
  className?: string;
  hidden?: boolean;
}
interface FormGroup {
  key: string;
  title: string;
  items: FormItem[];
}

export function CacheForm({ form, onChange }: { form: CacheFormState; onChange: CacheFormChange }) {
  const t = useTranslations();

  const id = useId();
  const locale = useLocale();
  const [tokenVisible, setTokenVisible] = useState(false);
  const [expirationOpen, setExpirationOpen] = useState(false);
  const [expirationMonth, setExpirationMonth] = useState<Date>();
  const [expirationDraft, setExpirationDraft] = useState('');
  const draftDate = expirationDraft ? new Date(expirationDraft) : undefined;
  const draftTime = expirationDraft.split('T')[1] || '00:00:00';
  const items: FormGroup[] = [
    {
      key: 'basic',
      title: t('admin.routes.shared.form.basicTitle'),
      items: [
        {
          key: 'name',
          label: t('shared.name'),
          description: t('admin.routes.shared.form.nameHelp'),
          descriptionId: `${id}-name-help`,
          htmlFor: `${id}-name`,
          required: true,
          content: (
            <Input
              id={`${id}-name`}
              aria-describedby={`${id}-name-help`}
              required
              maxLength={100}
              value={form.name}
              onChange={(event) => onChange('name', event.target.value)}
              placeholder={t('admin.routes.caches.form.namePlaceholder')}
            />
          ),
        },
        {
          key: 'pathname',
          label: t('admin.routes.shared.form.pathname'),
          htmlFor: `${id}-pathname`,
          description: t('admin.routes.shared.form.pathnameHelp'),
          descriptionId: `${id}-pathname-help`,
          required: true,
          content: (
            <Input
              id={`${id}-pathname`}
              required
              value={form.pathname}
              onChange={(event) => onChange('pathname', event.target.value)}
              placeholder="/example/path"
              aria-describedby={`${id}-pathname-help`}
            />
          ),
        },
        {
          key: 'description',
          label: t('shared.description'),
          htmlFor: `${id}-description`,
          description: t('admin.routes.shared.form.descriptionHelp'),
          descriptionId: `${id}-description-help`,
          content: (
            <Textarea
              id={`${id}-description`}
              aria-describedby={`${id}-description-help`}
              rows={3}
              maxLength={500}
              value={form.description}
              onChange={(event) => onChange('description', event.target.value)}
            />
          ),
        },
        {
          key: 'status',
          label: t('shared.status'),
          htmlFor: `${id}-status`,
          description: t(form.status ? 'shared.enabled' : 'shared.disabled'),
          descriptionId: `${id}-status-help`,
          content: (
            <Switch
              id={`${id}-status`}
              checked={form.status}
              onCheckedChange={(checked) => onChange('status', checked)}
              aria-describedby={`${id}-status-help`}
            />
          ),
        },
        {
          key: 'tags',
          label: t('shared.tags'),
          htmlFor: `${id}-tags`,
          description: t('admin.routes.shared.form.tagsHelp'),
          descriptionId: `${id}-tags-help`,
          content: (
            <TagSelect
              id={`${id}-tags`}
              group={ROUTE_TYPE.CACHE}
              value={form.tagIds}
              onChange={(ids) => onChange('tagIds', ids)}
              descriptionId={`${id}-tags-help`}
            />
          ),
        },
        {
          key: 'ttl',
          label: t('admin.routes.caches.form.ttl'),
          labelId: `${id}-ttl-label`,
          description: t('admin.routes.caches.form.ttlHelp'),
          descriptionId: `${id}-ttl-help`,
          content: (
            <div className="flex w-full items-center gap-4">
              <Slider
                min={0}
                max={30}
                step={1}
                value={[form.ttl]}
                aria-labelledby={`${id}-ttl-label`}
                aria-describedby={`${id}-ttl-help`}
                onValueChange={(value) => {
                  const ttl = Array.isArray(value) ? value[0] : value;

                  if (ttl !== undefined) {
                    onChange('ttl', ttl);
                  }
                }}
              />
              <output className="w-8 shrink-0 text-right text-sm tabular-nums">{form.ttl}</output>
            </div>
          ),
        },
      ],
    },
    {
      key: 'upstream',
      title: t('admin.routes.proxies.form.upstreamTitle'),
      items: [
        {
          key: 'url',
          label: t('admin.routes.proxies.form.url'),
          htmlFor: `${id}-url`,
          description: t('admin.routes.proxies.form.urlHelp'),
          descriptionId: `${id}-url-help`,
          required: true,
          content: (
            <Input
              id={`${id}-url`}
              type="url"
              aria-describedby={`${id}-url-help`}
              required
              pattern="https?://.+"
              value={form.url}
              onChange={(event) => onChange('url', event.target.value)}
              placeholder="https://api.example.com/resource"
            />
          ),
        },
        {
          key: 'method',
          label: t('admin.routes.proxies.form.method'),
          labelId: `${id}-method-label`,
          description: t('admin.routes.proxies.form.methodHelp'),
          descriptionId: `${id}-method-help`,
          content: (
            <Tabs
              value={form.method}
              onValueChange={(value) => {
                if (value === 'GET' || value === 'POST') {
                  onChange('method', value);
                }
              }}
            >
              <TabsList aria-labelledby={`${id}-method-label`} aria-describedby={`${id}-method-help`}>
                <TabsTrigger value="GET">GET</TabsTrigger>
                <TabsTrigger value="POST">POST</TabsTrigger>
              </TabsList>
            </Tabs>
          ),
        },
        {
          key: 'format',
          hidden: form.method !== 'POST',
          label: t('admin.routes.proxies.form.format'),
          labelId: `${id}-format-label`,
          content: (
            <RadioGroup
              value={form.format}
              onValueChange={(value) => {
                if (value === 'JSON' || value === 'TEXT' || value === 'FORM') {
                  onChange('format', value);
                }
              }}
              aria-labelledby={`${id}-format-label`}
              className="flex w-auto max-w-full flex-wrap items-center justify-end gap-5"
            >
              {(['JSON', 'TEXT', 'FORM'] as const).map((format) => (
                <div key={format} className="flex items-center gap-2">
                  <RadioGroupItem id={`${id}-format-${format}`} value={format} />
                  <FieldLabel htmlFor={`${id}-format-${format}`}>
                    {format === 'JSON' ? 'JSON' : format === 'TEXT' ? 'Text' : 'Form'}
                  </FieldLabel>
                </div>
              ))}
            </RadioGroup>
          ),
        },
        {
          key: 'body',
          hidden: form.method !== 'POST',
          label: t('admin.routes.proxies.form.body'),
          htmlFor: `${id}-body`,
          description: t('admin.routes.proxies.form.bodyHelp'),
          descriptionId: `${id}-body-help`,
          content: (
            <Textarea
              id={`${id}-body`}
              rows={9}
              className="font-mono"
              value={form.body}
              onChange={(event) => onChange('body', event.target.value)}
              aria-describedby={`${id}-body-help`}
            />
          ),
        },
        {
          key: 'cors',
          label: t('admin.routes.proxies.form.cors'),
          labelId: `${id}-cors-label`,
          description: t('admin.routes.proxies.form.corsHelp'),
          descriptionId: `${id}-cors-help`,
          content: (
            <Tabs
              value={form.cors}
              onValueChange={(value) => {
                if (value === -1 || value === 0 || value === 1) {
                  onChange('cors', value);
                }
              }}
            >
              <TabsList aria-labelledby={`${id}-cors-label`} aria-describedby={`${id}-cors-help`}>
                {([-1, 0, 1] as const).map((value) => (
                  <Tooltip key={value}>
                    <TooltipTrigger render={<TabsTrigger value={value} />}>
                      {t(
                        value === -1
                          ? 'admin.routes.proxies.form.corsPassthrough'
                          : value === 0
                            ? 'admin.routes.proxies.form.corsDisabled'
                            : 'admin.routes.proxies.form.corsEnabled',
                      )}
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {t(
                        value === -1
                          ? 'admin.routes.proxies.form.corsPassthroughDescription'
                          : value === 0
                            ? 'admin.routes.proxies.form.corsDisabledDescription'
                            : 'admin.routes.proxies.form.corsEnabledDescription',
                      )}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TabsList>
            </Tabs>
          ),
        },
        {
          key: 'proxy',
          label: t('admin.routes.proxies.form.proxy'),
          htmlFor: `${id}-proxy`,
          description: t('admin.routes.proxies.form.proxyHelp'),
          descriptionId: `${id}-proxy-help`,
          content: (
            <Input
              id={`${id}-proxy`}
              type="url"
              pattern="https?://.+"
              value={form.proxy}
              onChange={(event) => onChange('proxy', event.target.value)}
              placeholder="http://127.0.0.1:7890"
              aria-describedby={`${id}-proxy-help`}
            />
          ),
        },
      ],
    },
    {
      key: 'access',
      title: t('admin.routes.proxies.form.accessTitle'),
      items: [
        {
          key: 'headers',
          // className: '[--field-label-width:30%]',
          label: t('admin.routes.proxies.form.headers'),
          labelId: `${id}-headers-label`,
          description: t('admin.routes.proxies.form.headersHelp'),
          descriptionId: `${id}-headers-help`,
          content: (
            <RequestHeaders
              rows={form.headers}
              onChange={(rows) => onChange('headers', rows)}
              aria-labelledby={`${id}-headers-label`}
              aria-describedby={`${id}-headers-help`}
              labels={{
                add: t('admin.routes.proxies.form.addHeader'),
                remove: t('admin.routes.proxies.form.removeHeader'),
                name: t('admin.routes.proxies.form.headerName'),
                value: t('admin.routes.proxies.form.headerValue'),
              }}
            />
          ),
        },
        {
          key: 'token',
          label: t('admin.routes.shared.form.token'),
          htmlFor: `${id}-token`,
          description: t.rich('admin.routes.proxies.form.tokenHelp', {
            tokenQuery: '?token=<token>',
            code: (chunks) => <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">{chunks}</code>,
          }),
          descriptionId: `${id}-token-help`,
          content: (
            <InputGroup>
              <InputGroupInput
                id={`${id}-token`}
                type={tokenVisible ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.token}
                onChange={(event) => onChange('token', event.target.value)}
                aria-describedby={`${id}-token-help`}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  aria-label={t(tokenVisible ? 'shared.hide' : 'shared.show')}
                  aria-pressed={tokenVisible}
                  onClick={() => setTokenVisible((visible) => !visible)}
                >
                  {tokenVisible ? <EyeOff /> : <Eye />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          ),
        },
        {
          key: 'expiredAt',
          label: t('admin.routes.shared.form.expiredAt'),
          htmlFor: `${id}-expired-at`,
          description: t('admin.routes.shared.form.expiredAtHelp'),
          descriptionId: `${id}-expired-at-help`,
          content: (
            <Popover
              open={expirationOpen}
              onOpenChange={(open) => {
                if (open) {
                  setExpirationDraft(form.expiredAt ? format(new Date(form.expiredAt), "yyyy-MM-dd'T'HH:mm:ss") : '');
                  setExpirationMonth(form.expiredAt ? new Date(form.expiredAt) : new Date());
                }

                setExpirationOpen(open);
              }}
            >
              <div className="relative w-50 max-w-full">
                <PopoverTrigger
                  nativeButton={false}
                  render={
                    <Input
                      id={`${id}-expired-at`}
                      readOnly
                      value={form.expiredAt ? format(new Date(form.expiredAt), 'yyyy-MM-dd HH:mm:ss') : ''}
                      placeholder={t('admin.routes.shared.form.selectExpiration')}
                      aria-describedby={`${id}-expired-at-help`}
                      className="cursor-pointer pr-9"
                    />
                  }
                />
                <CalendarIcon
                  aria-hidden="true"
                  className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2"
                />
              </div>
              <PopoverContent
                side="top"
                align="center"
                className="w-auto max-w-[calc(100vw---spacing(8))] gap-0 p-0"
                aria-label={t('admin.routes.shared.form.expiredAt')}
              >
                <div className="flex flex-col sm:flex-row">
                  <Calendar
                    mode="single"
                    selected={draftDate}
                    month={expirationMonth}
                    onMonthChange={setExpirationMonth}
                    locale={locale === 'zh-CN' ? zhCN : enUS}
                    onSelect={(date) => setExpirationDraft(date ? `${format(date, 'yyyy-MM-dd')}T${draftTime}` : '')}
                  />
                  <div className="flex w-full flex-col gap-3 border-t p-3 sm:w-56 sm:border-t-0 sm:border-l">
                    <FieldLabel htmlFor={`${id}-expired-time`}>{t('admin.routes.shared.form.time')}</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id={`${id}-expired-time`}
                        type="time"
                        step={1}
                        value={draftTime}
                        disabled={!draftDate}
                        className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        onChange={(event) => {
                          if (draftDate && event.target.value) {
                            setExpirationDraft(`${format(draftDate, 'yyyy-MM-dd')}T${event.target.value}`);
                          }
                        }}
                      />
                      <InputGroupAddon>
                        <Clock2 />
                      </InputGroupAddon>
                    </InputGroup>
                    <ButtonGroup className="w-full" aria-label={t('admin.routes.shared.form.timePresets')}>
                      {(['midnight', 'now'] as const).map((preset) => (
                        <Button
                          key={preset}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          disabled={!draftDate}
                          onClick={() => {
                            if (draftDate) {
                              const time = preset === 'midnight' ? '00:00:00' : format(new Date(), 'HH:mm:ss');

                              setExpirationDraft(`${format(draftDate, 'yyyy-MM-dd')}T${time}`);
                            }
                          }}
                        >
                          {t(
                            preset === 'midnight'
                              ? 'admin.routes.shared.form.midnight'
                              : 'admin.routes.shared.form.currentTime',
                          )}
                        </Button>
                      ))}
                    </ButtonGroup>
                    <ButtonGroup className="w-full" aria-label={t('admin.routes.shared.form.expirationPresets')}>
                      {[1, 3, 7, 15].map((days) => (
                        <Button
                          key={days}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            const date = addDays(new Date(), days);

                            setExpirationDraft(`${format(date, 'yyyy-MM-dd')}T${draftTime}`);
                            setExpirationMonth(date);
                          }}
                        >
                          {t('admin.routes.shared.form.expirationDays', { days })}
                        </Button>
                      ))}
                    </ButtonGroup>
                  </div>
                </div>
                <div className="flex items-center justify-end border-t p-3">
                  <Button type="button" variant="ghost" className="mr-auto" onClick={() => setExpirationDraft('')}>
                    {t('shared.clear')}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setExpirationOpen(false)}>
                    {t('shared.cancel')}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      onChange('expiredAt', expirationDraft);
                      setExpirationOpen(false);
                    }}
                  >
                    {t('shared.confirm')}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          ),
        },
      ],
    },
  ];

  return (
    <>
      {items.map((group) => (
        <FieldSet key={group.key} className="min-w-0">
          <FieldLegend>{group.title}</FieldLegend>
          <FieldGroup className="gap-1">
            {group.items
              .filter((item) => !item.hidden)
              .map((item) => (
                <Field key={item.key} orientation="horizontal" className={`min-w-0 gap-2 ${item.className ?? ''}`}>
                  <FieldContent>
                    <FieldLabel htmlFor={item.htmlFor} id={item.labelId}>
                      {item.label}
                      {item.required && (
                        <span aria-hidden="true" className="text-destructive">
                          *
                        </span>
                      )}
                    </FieldLabel>
                    {item.description != null && (
                      <FieldDescription id={item.descriptionId}>{item.description}</FieldDescription>
                    )}
                  </FieldContent>
                  <div data-slot="field-control">{item.content}</div>
                </Field>
              ))}
          </FieldGroup>
        </FieldSet>
      ))}
    </>
  );
}
