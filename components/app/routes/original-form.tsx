'use client';

import { addDays, format } from 'date-fns';
import { CalendarIcon, Clock2, Eye, EyeOff } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { type ReactNode, useId, useState } from 'react';
import { enUS, zhCN } from 'react-day-picker/locale';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ROUTE_TYPE } from '@/lib/constants';
import type { OriginalFormChange, OriginalFormState } from '@/lib/types/routes';

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

export function OriginalForm({ form, onChange }: { form: OriginalFormState; onChange: OriginalFormChange }) {
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
              placeholder={t('admin.routes.originals.form.namePlaceholder')}
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
              group={ROUTE_TYPE.ORIGINAL}
              value={form.tagIds}
              onChange={(ids) => onChange('tagIds', ids)}
              descriptionId={`${id}-tags-help`}
            />
          ),
        },
      ],
    },
    {
      key: 'content',
      title: t('admin.routes.originals.form.contentTitle'),
      items: [
        {
          key: 'contentType',
          label: t('admin.routes.originals.form.contentType'),
          htmlFor: `${id}-content-type`,
          description: t('admin.routes.originals.form.contentTypeHelp'),
          descriptionId: `${id}-content-type-help`,
          required: true,
          content: (
            <Input
              id={`${id}-content-type`}
              required
              value={form.contentType}
              onChange={(event) => onChange('contentType', event.target.value)}
              placeholder="application/json"
              aria-describedby={`${id}-content-type-help`}
              autoCapitalize="none"
              spellCheck={false}
            />
          ),
        },
        {
          key: 'language',
          label: t('admin.routes.originals.form.language'),
          htmlFor: `${id}-language`,
          description: t('admin.routes.originals.form.languageHelp'),
          descriptionId: `${id}-language-help`,
          required: true,
          content: (
            <Input
              id={`${id}-language`}
              required
              value={form.language}
              onChange={(event) => onChange('language', event.target.value)}
              placeholder="plaintext"
              aria-describedby={`${id}-language-help`}
              autoCapitalize="none"
              spellCheck={false}
            />
          ),
        },
        {
          key: 'content',
          label: t('admin.routes.originals.form.content'),
          htmlFor: `${id}-content`,
          description: t('admin.routes.originals.form.contentHelp'),
          descriptionId: `${id}-content-help`,
          content: (
            <Textarea
              id={`${id}-content`}
              rows={16}
              className="min-h-64 resize-y font-mono"
              value={form.content}
              onChange={(event) => onChange('content', event.target.value)}
              aria-describedby={`${id}-content-help`}
              autoCapitalize="none"
              spellCheck={false}
            />
          ),
        },
      ],
    },
    {
      key: 'access',
      title: t('admin.routes.originals.form.accessTitle'),
      items: [
        {
          key: 'token',
          label: t('admin.routes.shared.form.token'),
          htmlFor: `${id}-token`,
          description: t.rich('admin.routes.originals.form.tokenHelp', {
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
                  type="button"
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
