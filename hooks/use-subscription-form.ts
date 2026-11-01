'use client';
import { useTranslations } from 'next-intl';
import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { getSubscription, updateSubscription } from '@/lib/requests/subscriptions';
import type { SubscriptionFormState } from '@/lib/types/subscriptions';

function initialForm(): SubscriptionFormState {
  return { name: '', description: '', status: true, pathname: '', token: '', expiredAt: '' };
}

async function loadForm(id: string, signal: AbortSignal): Promise<SubscriptionFormState> {
  const detail = await getSubscription(id, signal);

  return {
    name: detail.name,
    description: detail.description ?? '',
    status: detail.status,
    pathname: detail.pathname,
    token: detail.token ?? '',
    expiredAt: detail.expiredAt ?? '',
  };
}

function validateBaseForm(form: SubscriptionFormState) {
  if (!form.name.trim()) {
    return 'nameRequired';
  }

  if (form.name.trim().length > 100) {
    return 'nameMax';
  }

  const pathname = form.pathname.trim();

  if (!/^\/[a-zA-Z0-9_./-]+$/.test(pathname) || pathname.endsWith('/')) {
    return 'pathnameInvalid';
  }

  if (form.expiredAt && !Number.isFinite(new Date(form.expiredAt).getTime())) {
    return 'expiredAtInvalid';
  }
}

async function saveForm(form: SubscriptionFormState, id?: string) {
  await updateSubscription({
    ...(id ? { id } : {}),
    name: form.name.trim(),
    description: form.description.trim() || null,
    pathname: form.pathname.trim(),
    status: form.status,
    token: form.token.trim() || null,
    expiredAt: form.expiredAt ? new Date(form.expiredAt).toISOString() : null,
  });
}

export function useSubscriptionForm(onSaved: () => void, id?: string) {
  const t = useTranslations();
  const [form, setForm] = useState<SubscriptionFormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('ready');
  const controller = useRef<AbortController | null>(null);
  const pending = useRef(false);

  useEffect(() => () => controller.current?.abort(), [id]);

  function onChange<Key extends keyof SubscriptionFormState>(key: Key, value: SubscriptionFormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function cancelLoad() {
    controller.current?.abort();
  }

  async function reset() {
    cancelLoad();
    setForm(initialForm());
    setError('');

    if (!id) {
      setLoadState('ready');

      return;
    }

    const request = new AbortController();

    controller.current = request;
    setLoadState('loading');

    try {
      const loadedForm = await loadForm(id, request.signal);

      if (!request.signal.aborted) {
        setForm(loadedForm);
        setLoadState('ready');
      }
    } catch (reason) {
      if (!request.signal.aborted) {
        setError(
          reason instanceof Error && reason.message ? reason.message : t('admin.application.subscriptions.detailError'),
        );
        setLoadState('error');
      }
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pending.current || loadState !== 'ready') {
      return;
    }

    const baseIssue = validateBaseForm(form);
    const issue = baseIssue ? (`admin.application.subscriptions.validation.${baseIssue}` as const) : undefined;
    const validationError = issue ? t(issue) : undefined;

    setError(validationError ?? '');
    if (validationError) {
      return;
    }

    pending.current = true;
    setSubmitting(true);

    try {
      await saveForm(form, id);
    } catch (reason) {
      setError(
        reason instanceof Error && reason.message
          ? reason.message
          : t(id ? 'admin.application.subscriptions.updateError' : 'admin.application.subscriptions.createError'),
      );

      return;
    } finally {
      pending.current = false;
      setSubmitting(false);
    }

    onSaved();
  }

  return { form, onChange, submitting, error, loadState, reset, cancelLoad, submit };
}
