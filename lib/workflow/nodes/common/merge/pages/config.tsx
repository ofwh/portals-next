'use client';

import { useTranslations } from 'next-intl';
import type { NodeFormProps } from '../../../types';
import type { MergeConfig } from '../types';

export function MergeForm({ issues }: NodeFormProps<MergeConfig>) {
  const t = useTranslations('admin.application.subscriptions.flowEditor.commonNodes.merge');

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-sm">{t('help')}</p>
      {issues.length > 0 && (
        <div role="alert" className="text-destructive text-sm">
          {issues.map((issue) => (
            <p key={JSON.stringify([issue.path, issue.message])}>{issue.message}</p>
          ))}
        </div>
      )}
    </div>
  );
}
