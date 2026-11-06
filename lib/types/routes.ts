import type { caches, originals, proxies, redirects } from '@/lib/db/schema';
import type { PaginationParams } from './pagination';
import type { TagOption } from './tag';

export type RouteStatusFilter = 'all' | 'enabled' | 'disabled';

export interface RouteListParams extends PaginationParams {
  search?: string;
  status?: RouteStatusFilter;
}

export interface HeaderRow {
  id: string;
  name: string;
  value: string;
}

export interface RouteFormState {
  name: string;
  description: string;
  status: boolean;
  pathname: string;
  token: string;
  expiredAt: string;
  tagIds: string[];
}

export interface RequestFormState extends RouteFormState {
  url: string;
  method: 'GET' | 'POST';
  cors: -1 | 0 | 1;
  proxy: string;
  format: 'JSON' | 'TEXT' | 'FORM';
  body: string;
  headers: HeaderRow[];
}

export type ProxyStatusFilter = RouteStatusFilter;
export type ProxyListParams = RouteListParams;

type ProxyRow = typeof proxies.$inferSelect;

export type ProxyListItem = Pick<ProxyRow, 'id' | 'name' | 'description' | 'pathname' | 'url' | 'method' | 'status'> & {
  updatedAt: string;
  tags: TagOption[];
};

export type ProxyCreateInput = Omit<ProxyRow, 'id' | 'createdAt' | 'updatedAt' | 'expiredAt'> & {
  expiredAt: string | null;
  tagIds?: string[] | null;
};

export type ProxyDetail = ProxyCreateInput & {
  id: string;
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type ProxyUpdateInput = (ProxyCreateInput & { id?: never }) | (Partial<ProxyCreateInput> & { id: string });

export type ProxyFormState = RequestFormState;

export type ProxyFormChange = <Key extends keyof ProxyFormState>(key: Key, value: ProxyFormState[Key]) => void;

export type RedirectStatusFilter = RouteStatusFilter;
export type RedirectListParams = RouteListParams;

type RedirectRow = typeof redirects.$inferSelect;

export type RedirectListItem = Pick<
  RedirectRow,
  'id' | 'name' | 'description' | 'pathname' | 'url' | 'statusCode' | 'status'
> & {
  updatedAt: string;
  tags: TagOption[];
};

export type RedirectCreateInput = Omit<RedirectRow, 'id' | 'createdAt' | 'updatedAt' | 'expiredAt'> & {
  expiredAt: string | null;
  tagIds?: string[] | null;
};

export type RedirectDetail = RedirectCreateInput & {
  id: string;
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type RedirectUpdateInput =
  (RedirectCreateInput & { id?: never }) | (Partial<RedirectCreateInput> & { id: string });

export interface RedirectFormState extends RouteFormState {
  url: string;
  statusCode: RedirectCreateInput['statusCode'];
}

export type RedirectFormChange = <Key extends keyof RedirectFormState>(key: Key, value: RedirectFormState[Key]) => void;

export type CacheStatusFilter = RouteStatusFilter;
export type CacheListParams = RouteListParams;

type CacheRow = typeof caches.$inferSelect;

export type CacheListItem = Pick<CacheRow, 'id' | 'name' | 'description' | 'pathname' | 'url' | 'method' | 'status'> & {
  updatedAt: string;
  tags: TagOption[];
};

export type CacheCreateInput = Omit<CacheRow, 'id' | 'createdAt' | 'updatedAt' | 'expiredAt' | 'cachedAt'> & {
  expiredAt: string | null;
  tagIds?: string[] | null;
};

export type CacheDetail = CacheCreateInput & {
  id: string;
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type CacheUpdateInput = (CacheCreateInput & { id?: never }) | (Partial<CacheCreateInput> & { id: string });

export interface CacheFormState extends RequestFormState {
  ttl: number;
}

export type CacheFormChange = <Key extends keyof CacheFormState>(key: Key, value: CacheFormState[Key]) => void;

export type OriginalStatusFilter = RouteStatusFilter;
export type OriginalListParams = RouteListParams;

type OriginalRow = typeof originals.$inferSelect;

export type OriginalListItem = Pick<
  OriginalRow,
  'id' | 'name' | 'description' | 'pathname' | 'contentType' | 'language' | 'status'
> & {
  updatedAt: string;
  tags: TagOption[];
};

export type OriginalCreateInput = Omit<OriginalRow, 'id' | 'createdAt' | 'updatedAt' | 'expiredAt'> & {
  expiredAt: string | null;
  tagIds?: string[] | null;
};

export type OriginalDetail = OriginalCreateInput & {
  id: string;
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type OriginalUpdateInput =
  (OriginalCreateInput & { id?: never }) | (Partial<OriginalCreateInput> & { id: string });

export interface OriginalFormState extends RouteFormState {
  content: string;
  contentType: string;
  language: string;
}

export type OriginalFormChange = <Key extends keyof OriginalFormState>(key: Key, value: OriginalFormState[Key]) => void;
