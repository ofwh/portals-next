import { ROUTE_MODE_OPTIONS } from './routes';

export const ROUTE_TAG_GROUPS = ROUTE_MODE_OPTIONS;

export const SUBSCRIPTION_TAG_GROUP = 'subscriptions';

export const APPLICATION_TAG_GROUPS = [
  { label: 'admin.sidebar.subscriptions', value: SUBSCRIPTION_TAG_GROUP },
] as const;

export const SYSTEM_TAG_GROUPS = [] as const;

export const TAG_GROUPS = [...ROUTE_TAG_GROUPS, ...APPLICATION_TAG_GROUPS, ...SYSTEM_TAG_GROUPS] as const;
