import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { PreferencesProvider } from '@/components/app/settings/system/preferences-provider';
import { AdminShell } from '@/components/app/shell/admin-shell';
import { getRequestPreferences } from '@/lib/preferences/server';

async function AdminLayoutContent({ children }: { children: ReactNode }) {
  const [cookieStore, locale, messages, preferences] = await Promise.all([
    cookies(),
    getLocale(),
    getMessages(),
    getRequestPreferences(),
  ]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <PreferencesProvider initialPreferences={preferences}>
        <AdminShell defaultOpen={cookieStore.get('sidebar_state')?.value !== 'false'}>{children}</AdminShell>
      </PreferencesProvider>
    </NextIntlClientProvider>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="bg-sidebar min-h-svh" />}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}
