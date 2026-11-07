import { resolveMembers, takeSelectUrl, text } from './shared';
import type { GroupCategoryResolver } from './types';

export const selectResolver: GroupCategoryResolver = {
  kind: 'select',
  resolve(declaration) {
    const rules = [...declaration.rules];
    const rawUrl = declaration.fields.url;
    const url = takeSelectUrl(rules, rawUrl === undefined || rawUrl === '' ? undefined : text(rawUrl, 'url'));

    return { ...resolveMembers(declaration, rules), ...(url ? { healthCheck: { url } } : {}) };
  },
};
