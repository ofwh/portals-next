import { getOriginal, updateOriginal } from '@/lib/client/routes';
import { DEFAULT_CODE_LANGUAGE } from '@/lib/constants/code-editor';
import type { OriginalFormState } from '@/lib/types/routes';
import { initialRouteForm, routeDetailForm, routeInput } from './form';
import type { FormStrategy } from './strategy';

const strategy: FormStrategy<OriginalFormState> = {
  initialForm: () => ({
    ...initialRouteForm(),
    content: '',
    contentType: DEFAULT_CODE_LANGUAGE.contentType,
    language: DEFAULT_CODE_LANGUAGE.value,
  }),
  async load(id, signal) {
    const detail = await getOriginal(id, signal);

    return {
      ...routeDetailForm(detail),
      content: detail.content,
      contentType: detail.contentType,
      language: detail.language,
    };
  },
  validate(form) {
    if (!form.contentType.trim()) {
      return 'admin.routes.originals.validation.contentTypeRequired';
    }

    if (!form.language.trim()) {
      return 'admin.routes.originals.validation.languageRequired';
    }
  },
  async save(form, id) {
    const input = {
      ...routeInput(form),
      content: form.content,
      contentType: form.contentType.trim(),
      language: form.language.trim(),
    };

    await updateOriginal(id ? { ...input, id } : input);
  },
};

export default strategy;
