import { getProxy, updateProxy } from '@/lib/client/routes';
import { ROUTE_TYPE } from '@/lib/constants';
import type { ProxyFormState } from '@/lib/types/routes';
import { initialRequestForm, requestDetailForm, requestInput } from './form';
import { validateRequest } from './strategy';
import type { FormStrategy } from './strategy';

const strategy: FormStrategy<ProxyFormState> = {
  initialForm: initialRequestForm,
  async load(id, signal) {
    return requestDetailForm(await getProxy(id, signal));
  },
  validate: (form) => validateRequest(form, ROUTE_TYPE.PROXY),
  async save(form, id) {
    const input = requestInput(form);

    await updateProxy(id ? { ...input, id } : input);
  },
};

export default strategy;
