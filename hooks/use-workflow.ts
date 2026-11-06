'use client';

import { useLocale, useTranslations } from 'next-intl';
import { createContext, useCallback, useContext } from 'react';
import { toast } from 'sonner';
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { resolveLocale } from '@/i18n/config';
import { AppError, errorMessage } from '@/lib/api';
import type { WorkflowState, WorkflowStore } from '@/stores/workflow';

export const WorkflowContext = createContext<WorkflowStore | null>(null);
export type WorkflowValue = WorkflowState & {
  store: WorkflowStore;
  notifyError(reason: unknown): void;
};

export function useWorkflow(): WorkflowValue;
export function useWorkflow<Value>(selector: (state: WorkflowValue) => Value): Value;

export function useWorkflow(selector: (state: WorkflowValue) => unknown = (state) => state) {
  const store = useContext(WorkflowContext);
  const locale = useLocale();
  const t = useTranslations('admin.application.subscriptions.flowEditor');
  const notifyError = useCallback(
    (reason: unknown) => {
      toast.error(
        reason instanceof AppError
          ? errorMessage(reason, resolveLocale(locale))
          : reason instanceof Error && reason.message
            ? reason.message
            : t('actionError'),
      );
    },
    [locale, t],
  );

  if (!store) {
    throw new Error('WorkflowProvider is required');
  }

  return useStore(
    store,
    useShallow((state) => selector({ ...state, store, notifyError })),
  );
}
