import { getCache, updateCache } from '@/lib/client/routes';
import { ROUTE_TYPE } from '@/lib/constants';
import type { CacheFormState } from '@/lib/types/routes';
import { initialRequestForm, requestDetailForm, requestInput } from './form';
import { validateRequest } from './strategy';
import type { FormStrategy } from './strategy';

const strategy: FormStrategy<CacheFormState> = {
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
};

export default strategy;
