'use client';

import { LoaderCircle, LogOut, UserRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { authClient } from '@/lib/auth-client';

export function UserMenu() {
  const t = useTranslations();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [signingOut, setSigningOut] = useState(false);
  const username = session?.user.name || session?.user.email || t('admin.userMenu.user');

  async function signOut() {
    if (signingOut) {
      return;
    }

    setSigningOut(true);

    try {
      const { error } = await authClient.signOut();

      if (error) {
        toast.error(t('admin.userMenu.logoutError'));

        return;
      }

      router.replace('/sign-in');
      router.refresh();
    } catch {
      toast.error(t('admin.userMenu.logoutError'));
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="sm" className="min-w-0 gap-2" disabled={isPending || signingOut} />}
      >
        <Avatar size="sm">
          <AvatarImage src={session?.user.image ?? undefined} alt="" />
          <AvatarFallback>{session ? Array.from(username)[0]?.toUpperCase() : <UserRound />}</AvatarFallback>
        </Avatar>
        <span className="max-w-24 truncate sm:max-w-40" title={username}>
          {username}
        </span>
        {signingOut && <LoaderCircle className="animate-spin" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" className="min-w-40">
        <DropdownMenuItem render={<Link href="/settings/account" />}>
          <UserRound />
          {t('admin.sidebar.account')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" disabled={!session || signingOut} onClick={() => void signOut()}>
          <LogOut />
          {t('admin.userMenu.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
