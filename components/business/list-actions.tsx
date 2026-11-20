'use client';

import { Ellipsis } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Children, createContext, useContext, useState } from 'react';
import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ActionMenuContext = createContext<{ container: HTMLDivElement | null } | null>(null);

export function ListActions({ children, disabled }: { children: ReactNode; disabled: boolean }) {
  const t = useTranslations();
  const actions = Children.toArray(children);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <div className="flex items-center justify-center gap-1">
      {actions.length < 3 ? (
        actions
      ) : (
        <>
          {actions[0]}
          <DropdownMenu>
            <ActionMenuContext.Provider value={{ container }}>{actions.slice(1)}</ActionMenuContext.Provider>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={disabled}
                  aria-label={t('shared.moreActions')}
                />
              }
            >
              <Ellipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end" className="w-max min-w-0">
              <div ref={setContainer} />
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
}

export function ListActionTrigger({
  label,
  destructive = false,
  href,
  children,
  ref,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  destructive?: boolean;
  href?: string;
  ref?: Ref<HTMLButtonElement>;
}) {
  const menu = useContext(ActionMenuContext);

  if (menu) {
    return menu.container
      ? createPortal(
          <>
            {destructive && <DropdownMenuSeparator />}
            <DropdownMenuItem
              variant={destructive ? 'destructive' : 'default'}
              disabled={props.disabled}
              render={href ? <Link href={href} /> : <button {...props} ref={ref} type="button" />}
            >
              {children}
              {label}
            </DropdownMenuItem>
          </>,
          menu.container,
        )
      : null;
  }

  return (
    <Button
      {...props}
      ref={ref}
      type="button"
      variant="ghost"
      size="icon-sm"
      className={destructive ? 'text-destructive' : undefined}
      aria-label={label}
      nativeButton={!href}
      render={href ? <Link href={href} /> : undefined}
    >
      {children}
    </Button>
  );
}
