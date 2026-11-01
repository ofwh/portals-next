'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import type { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const tabs = [
  { value: 'preferences', href: '/settings/system/preferences' },
  { value: 'shortcuts', href: '/settings/system/shortcuts' },
  { value: 'tags', href: '/settings/system/tags' },
] as const;

export default function Layout({ children }: { children: ReactNode }) {
  const t = useTranslations('admin.settings.system');
  const segment = useSelectedLayoutSegment();
  const activeTab = segment ?? 'preferences';

  return (
    <Tabs value={activeTab} className="gap-6">
      <TabsList variant="line" className="w-full justify-start border-b p-0" aria-label={t('title')}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="h-full flex-none text-base group-data-horizontal/tabs:after:bottom-[-1px] first:border-l-0 first:pl-0"
            nativeButton={false}
            render={<Link href={tab.href} scroll={false} />}
          >
            {t(`tabs.${tab.value}`)}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={activeTab}>{children}</TabsContent>
    </Tabs>
  );
}
