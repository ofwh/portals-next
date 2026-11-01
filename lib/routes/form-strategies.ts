import { ROUTE_TYPE } from '@/lib/constants';
import type { RouteMode } from '@/lib/constants/routes';
import {
  getCache,
  getOriginal,
  getProxy,
  getRedirect,
  updateCache,
  updateOriginal,
  updateProxy,
  updateRedirect,
} from '@/lib/requests/routes';
import type {
  CacheFormState,
  OriginalFormState,
  ProxyFormState,
  RedirectFormState,
  RequestFormState,
} from '@/lib/types/routes';
import {
  initialRequestForm,
  initialRouteForm,
  requestDetailForm,
  requestInput,
  routeDetailForm,
  routeInput,
} from './form';
import { validateRequestForm, validUrl } from './validation';

export interface RouteForms {
  [ROUTE_TYPE.PROXY]: ProxyFormState;
  [ROUTE_TYPE.REDIRECT]: RedirectFormState;
  [ROUTE_TYPE.CACHE]: CacheFormState;
  [ROUTE_TYPE.ORIGINAL]: OriginalFormState;
}

type RequestIssue = Exclude<ReturnType<typeof validateRequestForm>, 'urlInvalid' | undefined>;
type FormIssue =
  | 'admin.routes.shared.validation.urlInvalid'
  | `admin.routes.${'proxies' | 'caches'}.validation.${RequestIssue}`
  | 'admin.routes.redirects.validation.statusCodeInvalid'
  | `admin.routes.originals.validation.${'contentTypeRequired' | 'languageRequired'}`;

interface FormStrategy<Form> {
  initialForm: () => Form;
  load: (id: string, signal: AbortSignal) => Promise<Form>;
  validate: (form: Form) => FormIssue | undefined;
  save: (form: Form, id?: string) => Promise<void>;
}

function validateRequest(form: RequestFormState, type: 'proxies' | 'caches'): FormIssue | undefined {
  const issue = validateRequestForm(form);

  if (issue === 'urlInvalid') {
    return 'admin.routes.shared.validation.urlInvalid';
  }

  if (issue) {
    return `admin.routes.${type}.validation.${issue}`;
  }
}

export const formStrategies: { [Type in RouteMode]: FormStrategy<RouteForms[Type]> } = {
  [ROUTE_TYPE.PROXY]: {
    initialForm: initialRequestForm,
    async load(id, signal) {
      return requestDetailForm(await getProxy(id, signal));
    },
    validate: (form) => validateRequest(form, ROUTE_TYPE.PROXY),
    async save(form, id) {
      const input = requestInput(form);

      await updateProxy(id ? { ...input, id } : input);
    },
  },
  [ROUTE_TYPE.CACHE]: {
    initialForm: () => ({ ...initialRequestForm(), ttl: 0 }),
    async load(id, signal) {
      const detail = await getCache(id, signal);

      return { ...requestDetailForm(detail), ttl: detail.ttl };
    },
    validate: (form) => validateRequest(form, ROUTE_TYPE.CACHE),
    async save(form, id) {
      const input = { ...requestInput(form), ttl: form.ttl };

      await updateCache(id ? { ...input, id } : input);
    },
  },
  [ROUTE_TYPE.REDIRECT]: {
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
  },
  [ROUTE_TYPE.ORIGINAL]: {
    initialForm: () => ({ ...initialRouteForm(), content: '', contentType: 'application/json', language: 'plaintext' }),
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
  },
};
