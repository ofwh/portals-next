import { getRedirect, updateRedirect } from '@/lib/client/routes';
import { validUrl } from '@/lib/shared/validation';
import type { RedirectFormState } from '@/lib/types/routes';
import { initialRouteForm, routeDetailForm, routeInput } from './form';
import type { FormStrategy } from './strategy';

const strategy: FormStrategy<RedirectFormState> = {
  initialForm: () => ({ ...initialRouteForm(), url: '', statusCode: 302 }),
  async load(id, signal) {
    const detail = await getRedirect(id, signal);

    return { ...routeDetailForm(detail), url: detail.url, statusCode: detail.statusCode };
  },
  validate(form) {
    if (!validUrl(form.url.trim())) {
      return 'admin.routes.shared.validation.urlInvalid';
    }

    if (![301, 302, 307, 308].includes(form.statusCode)) {
      return 'admin.routes.redirects.validation.statusCodeInvalid';
    }
  },
  async save(form, id) {
    const input = { ...routeInput(form), url: form.url.trim(), statusCode: form.statusCode };

    await updateRedirect(id ? { ...input, id } : input);
  },
};

export default strategy;
