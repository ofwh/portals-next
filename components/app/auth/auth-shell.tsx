'use client';

import { PanelsTopLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { LanguageControl, ThemeControl } from '@/components/app/settings/system/preferences-controls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';

export function AuthShell({ children }: { children: ReactNode }) {
  const t = useTranslations();
  const pathname = usePathname();
  const activeTab = pathname === '/sign-up' ? 'signUp' : 'signIn';

  return (
    <TooltipProvider>
      <div className="bg-background flex min-h-svh flex-col">
        <header className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link
            href="/"
            className="focus-visible:ring-ring flex items-center gap-2 rounded-sm text-base font-semibold tracking-tight outline-none focus-visible:ring-2"
          >
            <PanelsTopLeft className="size-5" />
            Portals
          </Link>
          <div className="flex items-center gap-1">
            <LanguageControl compact />
            <ThemeControl compact />
          </div>
        </header>
        <main className="flex max-h-320 flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h1 id="auth-title" className="text-2xl font-semibold tracking-tight">
                {t(`auth.${activeTab}.title`)}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm leading-6">{t(`auth.${activeTab}.description`)}</p>
            </div>
            <Tabs value={activeTab} className="w-full gap-8">
              <TabsList
                variant="line"
                className="grid w-full grid-cols-2 gap-0 border-b p-0"
                aria-label={t('auth.shared.navigation')}
              >
                <TabsTrigger
                  value="signIn"
                  className="w-full group-data-horizontal/tabs:after:bottom-[-1px]"
                  nativeButton={false}
                  render={<Link href="/sign-in" scroll={false} />}
                >
                  {t('auth.signIn.submit')}
                </TabsTrigger>
                <TabsTrigger
                  value="signUp"
                  className="w-full group-data-horizontal/tabs:after:bottom-[-1px]"
                  nativeButton={false}
                  render={<Link href="/sign-up" scroll={false} />}
                >
                  {t('auth.signUp.submit')}
                </TabsTrigger>
              </TabsList>
              <TabsContent value={activeTab} className="flex w-full items-center justify-center">
                {children}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
