'use client';

import { useTranslations } from 'next-intl';

export function useNodeConfig() {
  const t = useTranslations('workflowNodes.common.merge');

  return { title: t('name'), description: t('description') };
}
