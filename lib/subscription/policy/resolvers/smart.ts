import type { GroupCategoryResolver } from './types';
import { resolveLatencyGroup } from './url-test';

export const smartResolver: GroupCategoryResolver = { kind: 'smart', resolve: resolveLatencyGroup };
