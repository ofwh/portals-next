'use client';

import {
  ArrowRightLeft,
  DatabaseZap,
  FileCodeCorner,
  Gauge,
  Navigation,
  Orbit,
  Rss,
  Settings,
  UserRound,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const navigationGroups = [
  {
    label: 'dashboards',
    items: [{ label: 'dashboard', href: '/dashboard', icon: Gauge }],
  },
  {
    label: 'routes',
    items: [
      { label: 'proxies', href: '/routes/proxies', icon: ArrowRightLeft },
      { label: 'redirects', href: '/routes/redirects', icon: Navigation },
      { label: 'caches', href: '/routes/caches', icon: DatabaseZap },
      { label: 'originals', href: '/routes/originals', icon: FileCodeCorner },
    ],
  },
  {
    label: 'application',
    items: [{ label: 'subscriptions', href: '/application/subscriptions', icon: Rss }],
  },
  {
    label: 'settings',
    items: [
      { label: 'account', href: '/settings/account', icon: UserRound },
      { label: 'system', href: '/settings/system', icon: Settings },
    ],
  },
] as const;

function isNavigationActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const closeMobile = () => setOpenMobile(false);

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip={{ children: 'Portals', side: 'top' }}
              render={<Link href="/dashboard" onClick={closeMobile} />}
            >
              <Orbit className="size-6!" />
              <span className="text-base font-semibold">Portals</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <nav aria-label={t('admin.navigation')}>
          {navigationGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{t(`admin.groups.${group.label}`)}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const active = isNavigationActive(pathname, item.href);
                    const label = t(`admin.sidebar.${item.label}`);

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          isActive={active}
                          tooltip={{ children: label, side: 'top' }}
                          aria-current={active ? 'page' : undefined}
                          render={<Link href={item.href} onClick={closeMobile} />}
                        >
                          <item.icon />
                          <span>{label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </nav>
      </SidebarContent>
    </Sidebar>
  );
}
