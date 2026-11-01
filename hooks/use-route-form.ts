'use client';

import { useTranslations } from 'next-intl';
import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { RouteMode } from '@/lib/constants/routes';
import { formStrategies } from '@/lib/routes/form-strategies';
import type { RouteForms } from '@/lib/routes/form-strategies';
import { validateBaseForm } from '@/lib/routes/validation';

export function useRouteForm<Type extends RouteMode>(type: Type, onSaved: () => void, id?: string) {
  const t = useTranslations();
  const strategy = formStrategies[type];
  const messageKeys: {
    detail: `admin.routes.${RouteMode}.detailError`;
    save: `admin.routes.${RouteMode}.${'createError' | 'updateError'}`;
  } = {
    detail: `admin.routes.${type}.detailError`,
    save: `admin.routes.${type}.${id ? 'updateError' : 'createError'}`,
  };
  const [form, setForm] = useState<RouteForms[Type]>(strategy.initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('ready');
  const controller = useRef<AbortController | null>(null);
  const pending = useRef(false);

  useEffect(() => () => controller.current?.abort(), [id, type]);

  function onChange<Key extends keyof RouteForms[Type]>(key: Key, value: RouteForms[Type][Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function cancelLoad() {
    controller.current?.abort();
  }

  async function reset() {
    cancelLoad();
    setForm(strategy.initialForm());
    setError('');

    if (!id) {
      setLoadState('ready');

      return;
    }

    const request = new AbortController();

    controller.current = request;
    setLoadState('loading');

    try {
      const loadedForm = await strategy.load(id, request.signal);

      if (!request.signal.aborted) {
        setForm(loadedForm);
        setLoadState('ready');
      }
    } catch (reason) {
      if (!request.signal.aborted) {
        setError(reason instanceof Error && reason.message ? reason.message : t(messageKeys.detail));
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
    const issue = baseIssue ? (`admin.routes.shared.validation.${baseIssue}` as const) : strategy.validate(form);
    const validationError = issue ? t(issue) : undefined;

    setError(validationError ?? '');
    if (validationError) {
      return;
    }

    pending.current = true;
    setSubmitting(true);

    try {
      await strategy.save(form, id);
    } catch (reason) {
      setError(reason instanceof Error && reason.message ? reason.message : t(messageKeys.save));

      return;
    } finally {
      pending.current = false;
      setSubmitting(false);
    }

    onSaved();
  }

  return { form, onChange, submitting, error, loadState, reset, cancelLoad, submit };
}
