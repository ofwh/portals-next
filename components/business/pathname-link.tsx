'use client';

import { Check, Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function PathnameLink({ pathname, href }: { pathname: string; href: string }) {
  const t = useTranslations();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(href);
      if (timer.current !== null) {
        clearTimeout(timer.current);
      }

      setCopied(true);
      timer.current = setTimeout(() => {
        setCopied(false);
        timer.current = null;
      }, 2000);
      toast.success(t('shared.copySuccess'));
    } catch {
      toast.error(t('shared.copyError'));
    }
  }

  const label = t(copied ? 'shared.copySuccess' : 'shared.copyPath');

  return (
    <div className="group inline-flex w-fit items-center gap-1.5">
      <Tooltip>
        <TooltipTrigger
          render={
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary focus-visible:ring-ring inline-flex h-8 items-center rounded-sm text-sm font-medium no-underline outline-none hover:no-underline focus-visible:ring-2"
            />
          }
        >
          {pathname}
        </TooltipTrigger>
        <TooltipContent side="top" className="break-all">
          {href}
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className={`shrink-0 ${copied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100'}`}
              aria-label={label}
              onClick={() => void copy()}
            />
          }
        >
          {copied ? <Check className="text-green-500 dark:text-green-400" /> : <Copy />}
        </TooltipTrigger>
        <TooltipContent side="top">{label}</TooltipContent>
      </Tooltip>
    </div>
  );
}
