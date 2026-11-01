'use client';

import { LoaderCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { LanguageControl, ThemeControl } from '@/components/app/settings/system/preferences-controls';
import { Button } from '@/components/ui/button';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { usePreferences } from '@/hooks/use-preferences';
import { TIME_FORMATS } from '@/lib/date-time';

export default function Page() {
  const t = useTranslations();

  const { preferences, loading, saving, error, reload, save } = usePreferences();
  const [draft, setDraft] = useState<string | null>(null);
  const themeControlRef = useRef<HTMLDivElement>(null);
  const [themeControlWidth, setThemeControlWidth] = useState<number>();
  const timeFormat = draft ?? preferences.timeFormat;

  useEffect(() => {
    const element = themeControlRef.current;

    if (!element) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => setThemeControlWidth(entry.contentRect.width));

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await save({ timeFormat: timeFormat.trim() });
      setDraft(null);
      toast.success(t('admin.settings.system.preferences.saved'));
    } catch (reason) {
      toast.error(
        reason instanceof Error && reason.message ? reason.message : t('admin.settings.system.preferences.saveError'),
      );
    }
  }

  return (
    <section className="w-full max-w-3xl" aria-labelledby="system-preferences-title">
      <div className="mb-6">
        <h2 id="system-preferences-title" className="text-lg font-semibold">
          {t('admin.settings.system.preferences.title')}
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
          {t('admin.settings.system.preferences.description')}
        </p>
      </div>
      <form onSubmit={submit} noValidate>
        <FieldGroup>
          <Field orientation="responsive">
            <FieldContent>
              <FieldLabel>{t('admin.settings.system.preferences.theme')}</FieldLabel>
              <FieldDescription>{t('admin.settings.system.preferences.themeHelp')}</FieldDescription>
            </FieldContent>
            <div data-slot="field-control">
              <div ref={themeControlRef} className="w-fit max-w-full">
                <ThemeControl />
              </div>
            </div>
          </Field>
          <Field orientation="responsive">
            <FieldContent>
              <FieldLabel htmlFor="preferences-language">{t('admin.settings.system.preferences.language')}</FieldLabel>
              <FieldDescription>{t('admin.settings.system.preferences.languageHelp')}</FieldDescription>
            </FieldContent>
            <div data-slot="field-control">
              <LanguageControl />
            </div>
          </Field>
          <Field orientation="responsive">
            <FieldContent>
              <FieldLabel htmlFor="preferences-time-format">
                {t('admin.settings.system.preferences.timeFormat')}
              </FieldLabel>
              <FieldDescription>{t('admin.settings.system.preferences.timeFormatHelp')}</FieldDescription>
            </FieldContent>
            <div data-slot="field-control">
              <div className="max-w-full" style={{ width: themeControlWidth }}>
                <Combobox
                  items={TIME_FORMATS}
                  inputValue={timeFormat}
                  value={TIME_FORMATS.includes(timeFormat) ? timeFormat : null}
                  disabled={loading || saving || error !== null}
                  onInputValueChange={(value, details) => {
                    if (details.reason === 'input-change') {
                      setDraft(value);
                    }
                  }}
                  onValueChange={(value) => {
                    if (value) {
                      setDraft(value);
                    }
                  }}
                >
                  <ComboboxInput id="preferences-time-format" className="w-full" required maxLength={100} />
                  <ComboboxContent side="bottom">
                    <ComboboxEmpty>{t('admin.settings.system.preferences.customFormat')}</ComboboxEmpty>
                    <ComboboxList>
                      {(pattern: string) => (
                        <ComboboxItem key={pattern} value={pattern}>
                          {pattern}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            </div>
          </Field>
        </FieldGroup>
        {error !== null && (
          <div role="alert" className="text-destructive mt-6 flex items-center justify-between gap-3 text-sm">
            <span>{error || t('admin.settings.system.preferences.loadError')}</span>
            <Button type="button" variant="outline" disabled={loading} onClick={() => void reload()}>
              {t('shared.retry')}
            </Button>
          </div>
        )}
        <div className="mt-8 flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving && <LoaderCircle className="animate-spin" />}
            {saving ? t('shared.saving') : t('shared.save')}
          </Button>
        </div>
      </form>
    </section>
  );
}
