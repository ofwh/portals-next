'use client';

import { useTranslations } from 'next-intl';
import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { usePagination } from '@/hooks/use-pagination';
import { TAG_GROUPS } from '@/lib/constants/tags';
import { getTag, listTagOptions, listTags, removeTag, updateTag } from '@/lib/requests/tags';
import type { TagDetail, TagFormChange, TagInput, TagListParams, TagOption } from '@/lib/types/tag';

export const COLOR_PRESETS = {
  white: '#ffffff',
  gray: '#a5a5a5',
  lime: '#c4f042',
  blue: '#369eff',
  green: '#2dc653',
  amber: '#f59e0b',
  orange: '#f97316',
  rose: '#e11d48',
  purple: '#9333ea',
} as const;

export const DEFAULT_COLOR_SWATCHES = Object.values(COLOR_PRESETS);

const MAX_COLOR_SWATCHES = 18;

export function useTagColor(swatches: readonly string[] = DEFAULT_COLOR_SWATCHES) {
  const [recent, setRecent] = useState<string[]>([]);
  const defaultColors = [...new Set(swatches.map((color) => color.toLowerCase()))];
  const colors = [...defaultColors, ...recent.filter((color) => !defaultColors.includes(color))].filter(
    (_, index) => index < MAX_COLOR_SWATCHES,
  );

  function addRecent(value: string | null) {
    if (!value) {
      return;
    }

    const color = value.toLowerCase();

    if (!defaultColors.includes(color)) {
      setRecent((list) =>
        [color, ...list.filter((item) => item !== color && !defaultColors.includes(item))].filter(
          (_, index) => index < MAX_COLOR_SWATCHES,
        ),
      );
    }
  }

  return { colors, addRecent, textColor: COLOR_PRESETS.white, bgColor: COLOR_PRESETS.blue };
}

export function useTagList() {
  return usePagination<TagDetail, TagListParams>({
    initialParams: { page: 1, size: 10, search: '' },
    list: listTags,
    remove: removeTag,
  });
}

type TagOptionsState = { group: string; revision: number } & (
  { status: 'ready'; options: TagOption[] } | { status: 'error' }
);

export function useTagOptions(group: string) {
  const [state, setState] = useState<TagOptionsState | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    listTagOptions(group, controller.signal).then(
      (options) => {
        if (!controller.signal.aborted) {
          setState({ group, revision, status: 'ready', options });
        }
      },
      () => {
        if (!controller.signal.aborted) {
          setState({ group, revision, status: 'error' });
        }
      },
    );

    return () => controller.abort();
  }, [group, revision]);

  const current = state?.group === group && state.revision === revision ? state : null;

  function reload() {
    setRevision((value) => value + 1);
  }

  return {
    status: current?.status ?? 'loading',
    options: current?.status === 'ready' ? current.options : [],
    reload,
  };
}

function defaults(textColor: string, bgColor: string): TagInput {
  return { group: TAG_GROUPS[0].value, label: '', color: textColor, bgColor, rounded: 1 };
}

export function useTagForm(onSaved: () => void, id?: string) {
  const t = useTranslations('admin.settings.system.tags');
  const { textColor, bgColor } = useTagColor();
  const [form, setForm] = useState(() => defaults(textColor, bgColor));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('ready');
  const controller = useRef<AbortController | null>(null);
  const pending = useRef(false);
  const onChange: TagFormChange = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  useEffect(() => () => controller.current?.abort(), []);

  function cancelLoad() {
    controller.current?.abort();
  }

  async function reset() {
    cancelLoad();
    setForm(defaults(textColor, bgColor));
    setError('');

    if (!id) {
      setLoadState('ready');

      return;
    }

    const request = new AbortController();

    controller.current = request;
    setLoadState('loading');

    try {
      const detail = await getTag(id, request.signal);

      if (!request.signal.aborted) {
        setForm({
          group: detail.group,
          label: detail.label,
          color: detail.color,
          bgColor: detail.bgColor,
          rounded: detail.rounded,
        });
        setLoadState('ready');
      }
    } catch (error) {
      if (!request.signal.aborted) {
        setError(error instanceof Error && error.message ? error.message : t('detailError'));
        setLoadState('error');
      }
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current || loadState !== 'ready') {
      return;
    }

    setError('');
    if (!form.label.trim()) {
      setError(t('validation.labelRequired'));

      return;
    }

    pending.current = true;
    setSubmitting(true);
    try {
      await updateTag({
        ...(id ? { id } : {}),
        group: form.group,
        label: form.label.trim(),
        color: form.color,
        bgColor: form.bgColor,
        rounded: form.rounded,
      });
    } catch (error) {
      setError(error instanceof Error && error.message ? error.message : t(id ? 'updateError' : 'createError'));

      return;
    } finally {
      pending.current = false;
      setSubmitting(false);
    }
    onSaved();
  }

  return { form, onChange, submitting, error, loadState, reset, cancelLoad, submit };
}
