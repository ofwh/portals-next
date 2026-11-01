'use client';

import { Languages, Monitor, Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePreferences } from '@/hooks/use-preferences';
import { locales, resolveLocale } from '@/i18n/config';
import { resolveTheme, themes } from '@/lib/preferences';

const themeIcons = { light: Sun, dark: Moon, system: Monitor };

export function ThemeControl({ compact = false }: { compact?: boolean }) {
  const { preferences, loading, saving, save } = usePreferences();
  const theme = preferences.theme;
  const t = useTranslations('admin.settings.system.preferences');
  const disabled = loading || saving;
  const Icon = themeIcons[theme];

  function change(value: string) {
    void save({ theme: resolveTheme(value) }).catch((reason: unknown) => {
      toast.error(reason instanceof Error && reason.message ? reason.message : t('saveError'));
    });
  }

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" disabled={disabled} aria-label={t('theme')} />}
        >
          <Icon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup value={theme} onValueChange={change}>
            {themes.map((value) => {
              const ThemeIcon = themeIcons[value];

              return (
                <DropdownMenuRadioItem key={value} value={value} disabled={disabled} closeOnClick>
                  <ThemeIcon />
                  {t(value)}
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Tabs value={theme} onValueChange={(value) => change(String(value))}>
      <TabsList className="grid grid-cols-3 group-data-horizontal/tabs:h-auto" aria-label={t('theme')}>
        {themes.map((value) => {
          const ThemeIcon = themeIcons[value];

          return (
            <TabsTrigger key={value} value={value} disabled={disabled}>
              <span className="flex w-full flex-col items-center justify-center gap-2 p-2 text-center">
                <ThemeIcon />
                <span>{t(value)}</span>
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}

export function LanguageControl({ compact = false }: { compact?: boolean }) {
  const { preferences, loading, saving, save } = usePreferences();
  const language = preferences.language;
  const router = useRouter();
  const t = useTranslations('admin.settings.system.preferences');
  const [pending, startTransition] = useTransition();
  const languages = locales.map((value) => ({
    value,
    label: new Intl.DisplayNames([value], { type: 'language' }).of(value) ?? value,
  }));

  function change(value: string) {
    startTransition(async () => {
      try {
        await save({ language: resolveLocale(value) });
        router.refresh();
      } catch (reason) {
        toast.error(reason instanceof Error && reason.message ? reason.message : t('saveError'));
      }
    });
  }

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" disabled={pending || loading || saving} aria-label={t('language')} />
          }
        >
          <Languages />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup value={language} onValueChange={change}>
            {languages.map((language) => (
              <DropdownMenuRadioItem
                key={language.value}
                value={language.value}
                disabled={pending || loading || saving}
                closeOnClick
              >
                {language.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Select
      items={languages}
      value={language}
      disabled={pending || loading || saving}
      onValueChange={(value) => {
        if (value) {
          change(value);
        }
      }}
    >
      <SelectTrigger id="preferences-language" aria-label={t('language')}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent
        side="bottom"
        alignItemWithTrigger={false}
        className="w-max max-w-(--available-width) min-w-(--anchor-width)"
      >
        {languages.map((language) => (
          <SelectItem key={language.value} value={language.value}>
            {language.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
