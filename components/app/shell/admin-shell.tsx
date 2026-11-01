'use client';

import { ScrollArea as ScrollAreaPrimitive } from '@base-ui/react/scroll-area';
import { Home, PanelLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { LanguageControl, ThemeControl } from '@/components/app/settings/system/preferences-controls';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppSidebar } from './app-sidebar';
import { UserMenu } from './user-menu';

function AdminHeader() {
  const t = useTranslations();
  const { toggleSidebar } = useSidebar();

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b pl-3 md:pl-4 lg:pl-6">
      <Button variant="ghost" size="icon-sm" onClick={toggleSidebar} aria-label={t('admin.toggleSidebar')}>
        <PanelLeft />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        nativeButton={false}
        render={<Link href="/" />}
        aria-label={t('admin.home')}
      >
        <Home />
      </Button>
      <div className="ml-auto flex min-w-0 items-center gap-1">
        <LanguageControl compact />
        <ThemeControl compact />
        <Separator orientation="vertical" className="mx-1 data-vertical:h-4 data-vertical:self-center" />
        <UserMenu />
      </div>
    </header>
  );
}

export function AdminShell({ children, defaultOpen }: { children: ReactNode; defaultOpen: boolean }) {
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={defaultOpen} className="h-dvh min-h-0 overflow-hidden">
        <AppSidebar />
        <SidebarInset className="min-h-0 min-w-0 overflow-hidden">
          <AdminHeader />
          <ScrollArea className="min-h-0 flex-1 [&>[data-slot=scroll-area-viewport]]:overscroll-contain">
            <ScrollAreaPrimitive.Content className="p-4 md:p-6">{children}</ScrollAreaPrimitive.Content>
          </ScrollArea>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
