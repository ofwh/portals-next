'use client';

import { FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { NodeContentProps } from '../../../types';
import type { TextareaConfig } from '../types';

export const TextareaIcon = FileText;

export function TextareaContent({ node, mode }: NodeContentProps<TextareaConfig>) {
  const t = useTranslations('admin.application.subscriptions.flowEditor.commonNodes');

  return (
    <div className="flex h-full min-w-0 flex-col justify-between gap-3 p-4">
      <div className="flex min-w-0 items-center gap-2">
        <TextareaIcon className="size-4 shrink-0" />
        <span className="truncate font-medium">{mode === 'canvas' ? node.name : t('textarea.name')}</span>
      </div>
      <p className="text-muted-foreground truncate text-xs">
        {t(node.config.outputFormat === 'JSON' ? 'shared.formats.json' : 'shared.formats.text')} ·{' '}
        {t('textarea.summary', { count: node.config.text.length })}
      </p>
    </div>
  );
}
