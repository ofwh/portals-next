import type { subscriptions } from '@/lib/db/schema';
import type { PaginationParams } from '../pagination';

type SubscriptionRow = typeof subscriptions.$inferSelect;
export interface SubscriptionListParams extends PaginationParams {
  search?: string;
  status?: 'all' | 'enabled' | 'disabled';
}
export type SubscriptionListItem = Pick<SubscriptionRow, 'id' | 'name' | 'description' | 'status' | 'pathname'> & {
  hasFlow: boolean;
  updatedAt: string;
};
export type SubscriptionCreateInput = Omit<
  SubscriptionRow,
  'id' | 'createdAt' | 'updatedAt' | 'expiredAt' | 'flow' | 'flowDraft'
> & {
  flow?: string | null;
  expiredAt: string | null;
};
export type SubscriptionUpdateInput =
  (SubscriptionCreateInput & { id?: never }) | (Partial<SubscriptionCreateInput> & { id: string });
export type SubscriptionDetail = SubscriptionCreateInput & {
  id: string;
  flow: string | null;
  createdAt: string;
  updatedAt: string;
};
export interface SubscriptionFormState {
  name: string;
  description: string;
  status: boolean;
  pathname: string;
  token: string;
  expiredAt: string;
}
export type SubscriptionFormChange = <Key extends keyof SubscriptionFormState>(
  key: Key,
  value: SubscriptionFormState[Key],
) => void;

export interface SubscriptionStatusActions {
  pendingIds: ReadonlySet<string>;
  errors: Readonly<Record<string, string>>;
  clearError: (id: string) => void;
  changeStatus: (id: string) => Promise<boolean>;
}
