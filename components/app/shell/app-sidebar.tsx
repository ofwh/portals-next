'use client';

import { ChevronRight, Gauge, Settings, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useId, useState } from 'react';
import { Logo } from '@/components/business/logo';
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { ROUTE_ICONS } from '@/lib/constants/route-icons';

const NAVIGATION_GROUPS = [
  {
    label: 'dashboards',
    items: [{ label: 'dashboard', href: '/dashboard', icon: Gauge }],
  },
  {
    label: 'routes',
    items: [
      { label: 'proxies', href: '/routes/proxies', icon: ROUTE_ICONS.proxies },
      { label: 'redirects', href: '/routes/redirects', icon: ROUTE_ICONS.redirects },
      { label: 'caches', href: '/routes/caches', icon: ROUTE_ICONS.caches },
      { label: 'originals', href: '/routes/originals', icon: ROUTE_ICONS.originals },
    ],
  },
  {
    label: 'application',
    items: [{ label: 'subscriptions', href: '/application/subscriptions', icon: ROUTE_ICONS.subscriptions }],
  },
  {
    label: 'settings',
    items: [
      { label: 'account', href: '/settings/account', icon: UserRound },
      {
        label: 'system',
        href: '/settings/system',
        icon: Settings,
        children: [
          { label: 'preferences', href: '/settings/system/preferences' },
          { label: 'shortcuts', href: '/settings/system/shortcuts' },
          { label: 'tags', href: '/settings/system/tags' },
        ],
      },
    ],
  },
] as const;

function isNavigationActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const { isMobile, open, setOpen, setOpenMobile } = useSidebar();
  const [systemSettingsOpen, setSystemSettingsOpen] = useState(false);
  const systemSettingsMenuId = useId();
  const iconOnly = !isMobile && !open;
  const systemSettingsExpanded = systemSettingsOpen && !iconOnly;
  const closeMobile = () => setOpenMobile(false);

  function toggleSystemSettings() {
    if (iconOnly) {
      setOpen(true);
    }

    setSystemSettingsOpen(!systemSettingsExpanded);
  }

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="group-data-[collapsible=icon]:justify-center"
              tooltip={{ children: 'Portals', side: 'top' }}
              aria-label="Portals"
              render={<Link href="/dashboard" onClick={closeMobile} />}
            >
              <Logo variant="portal" />
              <span className="text-base font-semibold group-data-[collapsible=icon]:hidden">Portals</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <nav aria-label={t('admin.navigation')}>
          {NAVIGATION_GROUPS.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{t(`admin.groups.${group.label}`)}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const active = isNavigationActive(pathname, item.href);
                    const label = t(`admin.sidebar.${item.label}`);
                    const hasSubmenu = 'children' in item;

                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          isActive={active}
                          tooltip={{ children: label, side: 'top' }}
                          aria-current={!hasSubmenu && pathname === item.href ? 'page' : undefined}
                          aria-expanded={hasSubmenu ? systemSettingsExpanded : undefined}
                          aria-controls={hasSubmenu ? systemSettingsMenuId : undefined}
                          type={hasSubmenu ? 'button' : undefined}
                          onClick={hasSubmenu ? toggleSystemSettings : undefined}
                          render={hasSubmenu ? undefined : <Link href={item.href} onClick={closeMobile} />}
                        >
                          <item.icon />
                          <span className="truncate">{label}</span>
                          {hasSubmenu && (
                            <ChevronRight
                              aria-hidden="true"
                              className="ml-auto transition-transform group-aria-expanded/menu-button:rotate-90 group-data-[collapsible=icon]:hidden"
                            />
                          )}
                        </SidebarMenuButton>
                        {hasSubmenu && (
                          <SidebarMenuSub id={systemSettingsMenuId} hidden={!systemSettingsExpanded}>
                            {item.children.map((child) => {
                              const childActive = isNavigationActive(pathname, child.href);

                              return (
                                <SidebarMenuSubItem key={child.href}>
                                  <SidebarMenuSubButton
                                    isActive={childActive}
                                    aria-current={childActive ? 'page' : undefined}
                                    render={<Link href={child.href} onClick={closeMobile} />}
                                  >
                                    <span>{t(`admin.settings.system.${child.label}.title`)}</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        )}
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
