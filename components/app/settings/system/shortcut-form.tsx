'use client';

import { LoaderCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Fragment, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { DEFAULT_SHORTCUTS } from '@/lib/constants/shortcuts';
import type { Shortcut, ShortcutInput, ShortcutType } from '@/lib/types/shortcuts';

const shortcutTypes = [
  { type: 'proxy', label: 'proxies' },
  { type: 'redirect', label: 'redirects' },
  { type: 'cache', label: 'caches' },
  { type: 'original', label: 'originals' },
] as const satisfies ReadonlyArray<{ type: ShortcutType; label: string }>;

type ShortcutValues = Pick<ShortcutInput, 'pathname' | 'status'>;

interface ShortcutFormProps {
  items: Partial<Record<ShortcutType, Shortcut>>;
  disabled: boolean;
  saving: boolean;
  save: (input: ShortcutInput[]) => Promise<void>;
}

export function ShortcutForm({ items, disabled, saving, save }: ShortcutFormProps) {
  const t = useTranslations();
  const [draft, setDraft] = useState<Partial<Record<ShortcutType, ShortcutValues>>>({});
  const [error, setError] = useState<string | null>(null);

  function values(type: ShortcutType): ShortcutValues {
    return (
      draft[type] ?? {
        pathname: items[type]?.pathname ?? DEFAULT_SHORTCUTS[type].pathname,
        status: items[type]?.status ?? DEFAULT_SHORTCUTS[type].status,
      }
    );
  }

  function change(type: ShortcutType, input: Partial<ShortcutValues>) {
    setDraft((current) => ({ ...current, [type]: { ...values(type), ...input } }));
    setError(null);
  }

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await save(
        shortcutTypes.map(({ type }) => ({
          ...values(type),
          pathname: values(type).pathname.trim(),
          type,
          ...(items[type] ? { id: items[type].id } : {}),
        })),
      );
      setDraft({});
      toast.success(t('admin.settings.system.saved'));
    } catch (reason) {
      const message = reason instanceof Error && reason.message ? reason.message : t('admin.settings.system.saveError');

      setError(message);
      toast.error(message);
    }
  }

  return (
    <form onSubmit={submit} aria-busy={saving} noValidate>
      <FieldGroup>
        {shortcutTypes.map(({ type, label }) => {
          const value = values(type);
          const pathnameId = `shortcut-${type}-pathname`;
          const labelId = `shortcut-${type}-label`;
          const statusId = `shortcut-${type}-status`;

          return (
            <Fragment key={type}>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel id={labelId} htmlFor={pathnameId}>
                    {t(`admin.sidebar.${label}`)}
                  </FieldLabel>
                  <FieldDescription id={`${pathnameId}-help`}>
                    {t(`admin.settings.system.shortcuts.${type}.pathnameHelp`)}
                  </FieldDescription>
                </FieldContent>
                <div data-slot="field-control">
                  <Input
                    id={pathnameId}
                    disabled={disabled}
                    value={value.pathname}
                    required
                    placeholder="/path"
                    autoComplete="off"
                    spellCheck={false}
                    aria-describedby={`${pathnameId}-help`}
                    onChange={(event) => change(type, { pathname: event.target.value })}
                  />
                </div>
              </Field>
              <Field orientation="responsive">
                <FieldContent>
                  <FieldLabel id={`${statusId}-label`} htmlFor={statusId}>
                    {t('admin.settings.system.routeStatus', { name: t(`admin.sidebar.${label}`) })}
                  </FieldLabel>
                  <FieldDescription id={`${statusId}-help`}>
                    {t(`admin.settings.system.shortcuts.${type}.statusHelp`)}
                  </FieldDescription>
                </FieldContent>
                <div data-slot="field-control">
                  <Switch
                    id={statusId}
                    disabled={disabled}
                    checked={value.status}
                    aria-labelledby={`${statusId}-label`}
                    aria-describedby={`${statusId}-help`}
                    onCheckedChange={(status) => change(type, { status })}
                  />
                </div>
              </Field>
            </Fragment>
          );
        })}
      </FieldGroup>
      {error !== null && (
        <p role="alert" className="text-destructive mt-4 text-sm">
          {error}
        </p>
      )}
      <div className="mt-8 flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving && <LoaderCircle className="animate-spin" />}
          {saving ? t('shared.saving') : t('shared.save')}
        </Button>
      </div>
    </form>
  );
}
