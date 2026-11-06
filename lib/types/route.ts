import type { Dispatcher } from 'undici';
import type { RouteType } from '@/lib/constants/routes';
import type { caches, originals, proxies, redirects } from '@/lib/db/schema';
import type { ShortcutType } from '@/lib/types/shortcuts';

export interface ConfigMap {
  proxies: typeof proxies.$inferSelect;
  redirects: typeof redirects.$inferSelect;
  caches: typeof caches.$inferSelect;
  originals: typeof originals.$inferSelect;
}

export interface RouteParams {
  type: string;
  slug: string[];
}

export interface RouteHandlerContext {
  params: Promise<RouteParams>;
}

export interface RouteMatch {
  type: RouteType;
  pathname: string;
}

export interface RouteRequest {
  req: Request;
  params: RouteParams;
}

export interface ConsumerRequest extends RouteRequest {
  pathname: string;
}

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export type QueryValue = string | QueryValue[] | { [key: string]: QueryValue };
export type QueryData = Record<string, QueryValue>;
export type ParsedBody = JsonValue | Record<string, (string | File)[]> | Uint8Array;

export interface Parameters {
  params: RouteParams;
  query: QueryData;
  body: ParsedBody;
}

export interface OutboundRequest {
  url: URL;
  method: ConfigMap['proxies']['method'];
  headers: Headers;
  body: string | null;
  dispatcher: Dispatcher | undefined;
  signal: AbortSignal;
}

export interface CacheSnapshot {
  status: number;
  statusText: string;
  headers: [string, string][];
  body: Uint8Array;
  cachedAt: Date;
}

export interface CacheKey {
  routeId: string;
  revision: string;
}

export interface RouteContext<K extends RouteType> extends ConsumerRequest {
  config: ConfigMap[K];
  now: Date;
  parameters: Parameters | null;
  outbound: OutboundRequest | null;
  upstream: Response | null;
  snapshot: CacheSnapshot | null;
  response: Response | null;
}

export type Next = () => Promise<void>;
export type Middleware<K extends RouteType> = (context: RouteContext<K>, next: Next) => Promise<void>;
export type ForwardMode = 'proxies' | 'caches';

export interface ConsumerMiddleware<K extends RouteType> {
  request: readonly Middleware<K>[];
  response: readonly Middleware<K>[];
}

export interface RouteConsumer<K extends RouteType> {
  readonly mode: K;
  handle(input: ConsumerRequest): Promise<Response>;
}

export interface ProxyRouteConsumer extends RouteConsumer<'proxies'> {
  request(outbound: OutboundRequest): Promise<Response>;
}

export interface CacheRouteConsumer extends RouteConsumer<'caches'> {
  invalidate(config: ConfigMap['caches']): Promise<void>;
}

export interface RedisSetOptions {
  ttlSeconds?: number;
}

export interface CacheRecord {
  status: number;
  statusText: string;
  headers: [string, string][];
  bodyBase64: string;
  cachedAt: string;
}

export interface DeliveryError extends Error {
  readonly status: number;
}

export interface ShortcutSettings {
  pathname: string;
  status: boolean;
}

export interface ApplicationConfig {
  readonly shortcuts: Readonly<Record<ShortcutType, Readonly<ShortcutSettings>>>;
}

export interface AppContext {
  config: ApplicationConfig;
}
