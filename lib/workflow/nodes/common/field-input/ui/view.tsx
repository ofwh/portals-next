'use client';

import { FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { NodeContentProps } from '../../../types';
import type { FieldInputConfig } from '../model/types';

export const FieldInputIcon = FileText;

export function FieldInputContent({ node, mode }: NodeContentProps<FieldInputConfig>) {
  const t = useTranslations('workflowNodes.common');

  return (
    <div className="flex h-full min-w-0 flex-col justify-between gap-3 p-4">
      <div className="flex min-w-0 items-center gap-2">
        <FieldInputIcon className="size-4 shrink-0" />
        <span className="truncate font-medium">{mode === 'canvas' ? node.name : t('fieldInput.name')}</span>
      </div>
      <p className="text-muted-foreground truncate text-xs">
        {t(node.config.outputFormat === 'JSON' ? 'shared.formats.json' : 'shared.formats.text')} ·{' '}
        {t('fieldInput.summary', { count: node.config.text.length })}
      </p>
    </div>
  );
}
