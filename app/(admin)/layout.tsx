import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { cookies } from 'next/headers';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { PreferencesProvider } from '@/components/app/settings/system/preferences-provider';
import { ShortcutsProvider } from '@/components/app/settings/system/shortcuts-provider';
import { AdminShell } from '@/components/app/shell/admin-shell';
import { getAppContext } from '@/lib/context';
import { getRequestPreferences } from '@/lib/services/preferences/server';

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
        <ShortcutsProvider initialShortcuts={getAppContext().config.shortcuts}>
          <AdminShell defaultOpen={cookieStore.get('sidebar_state')?.value !== 'false'}>{children}</AdminShell>
        </ShortcutsProvider>
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
