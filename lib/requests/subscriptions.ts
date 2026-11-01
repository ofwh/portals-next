import type { Pagination } from '@/lib/types/pagination';
import type {
  SubscriptionDetail,
  SubscriptionListItem,
  SubscriptionListParams,
  SubscriptionUpdateInput,
} from '@/lib/types/subscriptions';
import { request } from './request';

export function listSubscriptions(params: SubscriptionListParams, signal: AbortSignal) {
  return request<Pagination<SubscriptionListItem>>('/api/subscriptions/list', params, signal);
}

export function getSubscription(id: string, signal: AbortSignal) {
  return request<SubscriptionDetail>('/api/subscriptions/detail', { id }, signal);
}

export async function updateSubscription(input: SubscriptionUpdateInput): Promise<void> {
  await request<unknown>('/api/subscriptions/update', input);
}

export async function removeSubscription(id: string): Promise<void> {
  await request<{ id: string }>('/api/subscriptions/remove', { id });
}
