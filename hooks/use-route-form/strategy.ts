import type { ROUTE_TYPE } from '@/lib/constants';
import type {
  CacheFormState,
  OriginalFormState,
  ProxyFormState,
  RedirectFormState,
  RequestFormState,
} from '@/lib/types/routes';
import { validateRequestForm } from './validation';

export interface RouteForms {
  [ROUTE_TYPE.PROXY]: ProxyFormState;
  [ROUTE_TYPE.REDIRECT]: RedirectFormState;
  [ROUTE_TYPE.CACHE]: CacheFormState;
  [ROUTE_TYPE.ORIGINAL]: OriginalFormState;
}

type RequestIssue = Exclude<ReturnType<typeof validateRequestForm>, 'urlInvalid' | undefined>;
export type FormIssue =
  | 'admin.routes.shared.validation.urlInvalid'
  | `admin.routes.${'proxies' | 'caches'}.validation.${RequestIssue}`
  | 'admin.routes.redirects.validation.statusCodeInvalid'
  | `admin.routes.originals.validation.${'contentTypeRequired' | 'languageRequired'}`;

export interface FormStrategy<Form> {
  initialForm: () => Form;
  load: (id: string, signal: AbortSignal) => Promise<Form>;
  validate: (form: Form) => FormIssue | undefined;
  save: (form: Form, id?: string) => Promise<void>;
}

export function validateRequest(form: RequestFormState, type: 'proxies' | 'caches'): FormIssue | undefined {
  const issue = validateRequestForm(form);

  if (issue === 'urlInvalid') {
    return 'admin.routes.shared.validation.urlInvalid';
  }

  if (issue) {
    return `admin.routes.${type}.validation.${issue}`;
  }
}
