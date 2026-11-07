import { resolveMembers } from './shared';
import type { GroupCategoryResolver } from './types';

export const ssidResolver: GroupCategoryResolver = { kind: 'ssid', resolve: resolveMembers };
