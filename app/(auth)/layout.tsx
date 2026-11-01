import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { AuthShell } from '@/components/app/auth/auth-shell';
import { PreferencesProvider } from '@/components/app/settings/system/preferences-provider';
import { getRequestPreferences } from '@/lib/preferences/server';

async function AuthLayoutContent({ children }: { children: ReactNode }) {
  const [locale, messages, preferences] = await Promise.all([getLocale(), getMessages(), getRequestPreferences()]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <PreferencesProvider initialPreferences={preferences}>
        <AuthShell>{children}</AuthShell>
      </PreferencesProvider>
    </NextIntlClientProvider>
  );
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="bg-background min-h-svh" />}>
      <AuthLayoutContent>{children}</AuthLayoutContent>
    </Suspense>
  );
}
