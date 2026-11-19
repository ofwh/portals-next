import { ChartNoAxesCombined, Route, SlidersHorizontal, UserRound, Workflow } from 'lucide-react';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Suspense } from 'react';
import { PortalBackground } from '@/components/app/home/portal-background';
import { LanguageControl, ThemeControl } from '@/components/app/settings/system/preferences-controls';
import { PreferencesProvider } from '@/components/app/settings/system/preferences-provider';
import { Logo } from '@/components/business/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { buttonVariants } from '@/components/ui/button';
import { getRequestSession } from '@/lib/auth/session';
import { getRequestPreferences } from '@/lib/services/preferences/server';
import { cn } from '@/lib/shared/classnames';

const FEATURES = [
  { key: 'routes', icon: Route },
  { key: 'subscriptions', icon: Workflow },
  { key: 'analytics', icon: ChartNoAxesCombined },
  { key: 'settings', icon: SlidersHorizontal },
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();

  return { title: 'Portals', description: t('home.description') };
}

async function LandingPage() {
  const [t, preferences, session, messages] = await Promise.all([
    getTranslations(),
    getRequestPreferences(),
    getRequestSession(),
    getMessages(),
  ]);
  const user = session?.user;
  const username = user?.name.trim() || user?.email;
  const initial = username ? Array.from(username)[0]?.toUpperCase() : undefined;

  return (
    <NextIntlClientProvider
      locale={preferences.language}
      messages={{ admin: { settings: { system: { preferences: messages.admin.settings.system.preferences } } } }}
    >
      <PreferencesProvider initialPreferences={preferences}>
        <header className="mx-auto flex h-18 w-full max-w-6xl items-center justify-between gap-2 px-6 sm:gap-4 sm:px-10">
          <Link
            href="/"
            className="focus-visible:ring-ring inline-flex items-center gap-2.5 rounded-sm text-lg font-semibold tracking-tight outline-none focus-visible:ring-2"
          >
            <Logo variant="portal" />
            <span className="max-[23rem]:sr-only">Portals</span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-3">
            <div className="flex items-center gap-1">
              <LanguageControl compact />
              <ThemeControl compact />
            </div>
            {user ? (
              <>
                <Link href="/dashboard" className={cn(buttonVariants({ size: 'sm' }), 'rounded-full px-4')}>
                  {t('admin.sidebar.dashboard')}
                </Link>
                <Link
                  href="/settings/account"
                  className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'size-10 rounded-full' })}
                  aria-label={t('admin.sidebar.account')}
                >
                  <Avatar>
                    <AvatarImage src={user.image ?? undefined} alt="" />
                    <AvatarFallback>{initial || <UserRound aria-hidden="true" />}</AvatarFallback>
                  </Avatar>
                </Link>
              </>
            ) : (
              <Link
                href="/sign-in"
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  'relative isolate rounded-full border-0 px-4 shadow-[0_0_10px_#e7754b26]',
                )}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-full"
                >
                  <span
                    className="absolute top-1/2 left-1/2 aspect-square w-[150%] -translate-x-1/2 -translate-y-1/2 motion-safe:animate-spin"
                    style={{
                      animationDuration: '18s',
                      backgroundImage:
                        'conic-gradient(from 205deg, #a4506155, #e7754baf 76deg, #ffdfadc9 145deg, #c07b6566 215deg, #a4506138 290deg, #a4506155)',
                    }}
                  />
                  <span className="bg-background group-hover/button:bg-muted absolute inset-px rounded-full" />
                </span>
                {t('auth.signIn.submit')}
              </Link>
            )}
          </nav>
        </header>

        <main>
          <section aria-labelledby="home-title" className="border-border relative isolate overflow-hidden border-b">
            <PortalBackground />
            <div className="relative mx-auto grid min-h-150 max-w-6xl items-center px-6 sm:px-10 md:min-h-165">
              <div className="self-start pt-16 pb-72 sm:pt-20 md:self-center md:py-20">
                <h1
                  id="home-title"
                  className="max-w-xl [font-family:var(--font-geist-sans)] text-[clamp(1.875rem,8vw,3rem)] leading-[1.02] font-semibold tracking-tight whitespace-pre-line sm:text-6xl lg:text-7xl"
                >
                  {t('home.title')}
                </h1>
                <p className="text-muted-foreground mt-6 max-w-96 text-base leading-7 sm:text-lg">
                  {t('home.description')}
                </p>
              </div>
            </div>
          </section>

          <section
            id="features"
            aria-labelledby="features-title"
            className="mx-auto grid max-w-6xl scroll-mt-8 gap-8 px-6 pt-16 pb-20 sm:px-10 md:grid-cols-[1fr_2fr] md:gap-12 md:py-24"
          >
            <h2 id="features-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t('home.features.title')}
            </h2>
            <ul className="divide-border border-border divide-y border-y">
              {FEATURES.map(({ key, icon: Icon }) => (
                <li key={key} className="grid grid-cols-[auto_1fr] items-start gap-x-4 gap-y-1 py-5">
                  <Icon
                    aria-hidden="true"
                    className="text-muted-foreground row-span-2 mt-0.5 size-5"
                    strokeWidth={1.5}
                  />
                  <h3 className="font-medium">{t(`home.features.${key}.title`)}</h3>
                  <p className="text-muted-foreground text-sm leading-6">{t(`home.features.${key}.description`)}</p>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </PreferencesProvider>
    </NextIntlClientProvider>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="bg-background min-h-svh" />}>
      <LandingPage />
    </Suspense>
  );
}
