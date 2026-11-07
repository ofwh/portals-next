import { resolveMembers } from './shared';
import type { GroupCategoryResolver } from './types';

export const relayResolver: GroupCategoryResolver = { kind: 'relay', resolve: resolveMembers };
