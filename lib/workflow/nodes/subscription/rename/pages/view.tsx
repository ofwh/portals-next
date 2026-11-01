'use client';

import { CaseSensitive } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { NodeContentProps } from '../../../types';
import type { RenameConfig } from '../types';

export const RenameIcon = CaseSensitive;

export function RenameContent({ node, mode }: NodeContentProps<RenameConfig>) {
  const t = useTranslations('admin.application.subscriptions.flowEditor.subscriptionNodes.rename');

  return (
    <div className="flex h-full min-w-0 flex-col justify-between gap-3 p-4">
      <div className="flex min-w-0 items-center gap-2">
        <RenameIcon className="size-4 shrink-0" />
        <span className="truncate font-medium">{mode === 'canvas' ? node.name : t('name')}</span>
      </div>
      <p className="text-muted-foreground truncate text-xs">{t('summary', { count: node.config.rules.length })}</p>
    </div>
  );
}
