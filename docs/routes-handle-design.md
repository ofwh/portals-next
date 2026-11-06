# 路由交付技术方案

## 设计边界

本文定义路由交付入口、四种模式的独立消费类、消费实例及请求与响应中间件的职责和接口。文中的新增模块与签名均为设计，不代表已有实现；文档确认不等于授权实施，只有明确要求“开始实施”后才修改业务源码或安装依赖。

服务分层与协议响应遵循 [API 规范](api.md)，类型与引用遵循 [编码规范](coding.md)。本入口属于实际路由交付协议边界，直接返回 HTTP 状态、响应头和内容，不包装为管理 API 的 `BaseResponse`。

## 配置与交付语义

配置来源为 `routes/proxies`、`routes/redirects`、`routes/caches`、`routes/originals` 页面的持久化配置。配置字段类型复用数据库推导类型，不另行维护相同字段定义。

| 配置范围     | 处理约束                                                                                                                                              |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 公共访问约束 | 按模式和 pathname 精确查找；不存在或停用返回 404；配置 token 时校验查询参数中的单个字符串 token，不接受重复值或对象；到期后返回 410；鉴权失败返回 401 |
| proxies      | 使用配置的 url、method、body、format、headers、proxy 请求远程资源，跟随重定向，返回最终响应的状态、响应头和原始内容                                   |
| redirects    | 返回配置的 statusCode 与 Location；不请求远程地址，不在服务端跟随跳转                                                                                 |
| caches       | 复用远程请求能力；命中时交付缓存，未命中或过期时获取最终响应并保存；ttl 单位为天，0 表示永久，负值或非有限值为无效配置                                |
| originals    | 按 contentType 返回 content；language 仅用于编辑器，不参与内容转换                                                                                    |
| cors         | -1 保留远程 CORS 响应头；0 移除；1 移除后设置允许跨域策略；仅 proxies、caches 具有此配置                                                              |

入口与缓存约束：

- 缓存仅指服务端 Redis 缓存，通过 `.env` 配置连接套接字；caches 路由经 Redis 服务层读写，不使用本地文件缓存或浏览器缓存。

- 入口仅定义并导出 GET、POST；入口方法与配置的远程 method 独立。

以下参数处理语义仍作为建议随本文确认：

- `{params, query, body}` 表达入口请求数据。当前配置未定义模板或变量替换，因此仅解析，不自动合并到远程 URL、请求体、请求头或重定向地址；远程请求由配置独立确定。
- 不透传入口 Cookie、Authorization 等请求头，不把入口 token 发送给远程资源；远程凭据通过配置 headers 声明。

## 模块文件树

下列为本方案涉及的组织结构，标记“扩展”的文件保留原有职责和公开方法。

```text
instrumentation.ts                      # 新增：启动时加载配置与初始化应用上下文
app/
└── [type]/
    └── [...slug]/
        └── route.ts                    # 新增：GET/POST 入口
lib/
├── context.ts                          # 新增：getAppContext 与配置注入
├── types/
│   └── route.ts                        # 新增：路由交付与 Redis 调用契约
├── services/
│   ├── config.ts                       # 新增：服务端全局配置读取与刷新
│   ├── redis.ts                        # 新增：通用 Redis 服务
│   ├── shortcuts.ts                    # 扩展：公开路由别名前缀解析
│   └── routes/
│       ├── index.ts                    # 保留：配置管理服务聚合
│       ├── proxies.ts                  # 扩展：代理消费实例调用
│       ├── redirects.ts                # 扩展：重定向消费实例调用
│       ├── caches.ts                   # 扩展：缓存消费实例调用与配置失效处理
│       ├── originals.ts                # 扩展：原始内容消费实例调用
│       ├── consumers/
│       │   ├── index.ts                # 新增：统一导出配置后的消费实例
│       │   ├── proxies.ts              # 新增：ProxyConsumer 与 proxies
│       │   ├── redirects.ts            # 新增：RedirectConsumer 与 redirects
│       │   ├── caches.ts               # 新增：CacheConsumer 与 caches
│       │   └── originals.ts            # 新增：OriginalConsumer 与 originals
│       └── middleware/
│           ├── index.ts                # 新增：中间件具名导出
│           ├── request.parameters.ts   # 新增：入口参数与配置请求体解析
│           ├── request.headers.ts      # 新增：配置请求头
│           ├── request.proxy.ts        # 新增：选择网络代理
│           ├── request.authorize.ts    # 新增：路由令牌鉴权
│           ├── request.expired.ts      # 新增：到期判断
│           ├── response.cors.ts        # 新增：跨域响应头
│           ├── response.proxy.ts       # 新增：远程响应转换
│           ├── response.redirect.ts    # 新增：重定向响应构造
│           ├── response.cache.ts       # 新增：缓存快照响应构造
│           └── response.original.ts    # 新增：原始内容响应构造
└── repositories/
    └── caches.ts                       # 扩展：独立更新 cachedAt
.env                                    # 配置 Redis 连接，不提交凭据
```

其他模式复用已有 repository 的 `findByPath`，不增加重复查询模块。`service.ts` 和 `validation.ts` 保持配置管理职责；缓存 ttl 的合法性同时纳入保存校验。`proxy.ts` 维持管理 API 边界，路由 token 鉴权由本方案中间件完成。

## 执行链与职责

`route.ts` 在 API 层优先识别 type；先通过 shortcuts service 解析已启用的路由别名前缀，匹配后才加载并调用对应模式 service.handle，后者调用已配置的消费实例 handle。未匹配时调用 Next.js 的 notFound()，终止入口并由框架处理 404，不加载对应路由业务服务或消费实例。Route Handler 不支持继续尝试其他路由匹配。每种模式使用独立的 Consumer class，位于服务层的 consumers 目录。消费类负责通过本模式 repository 读取配置、检查启用状态、创建请求上下文并执行中间件与业务处理。

| 模式      | 请求链                                                        | 模式内部业务终端                     | 响应链                |
| --------- | ------------------------------------------------------------- | ------------------------------------ | --------------------- |
| proxies   | parameters → authorize → expired → outbound → headers → proxy | 执行远程请求                         | response.proxy → cors |
| redirects | parameters → authorize → expired                              | 提供跳转目标与状态                   | response.redirect     |
| caches    | parameters → authorize → expired → outbound → headers → proxy | 查缓存；必要时请求、生成快照并写缓存 | response.cache → cors |
| originals | parameters → authorize → expired                              | 提供内容与类型                       | response.original     |

中间件采用 `(context, next) => Promise<void>`。模块加载时实例化消费类，并通过实例的 `use({ request, response })` 配置两段中间件；类内部固定将本类 execute 放在两段之间。全部按配置顺序正向执行，每个步骤完成后调用一次 `await next()`；execute 同样遵循此签名。各类的私有 run 拒绝重复调用 next，结束后返回 context.response；未形成 Response 视为内部错误。

`use` 只负责注册、复制并固定中间件配置，不执行请求。注册在实例导出前一次完成，handle 不重复注册；首次处理请求后禁止修改配置。四个消费类独立承载各自业务与错误收口，不新增 pipeline、transport、protocol 模块或通用消费基类。

中间件只解析或转换自身配置，不选择路由模式，不决定缓存命中、是否回源及是否写入。`response.proxy` 不发起请求，`response.cache` 不读写缓存；实际业务决策均位于各模式的消费类。

## 公共类型签名

以下代码块只描述接口，不提供方法实现。跨模块类型从 `lib/types/route.ts` 引用；库类型以正式依赖声明为准。

```ts
import type { Dispatcher } from 'undici';
import type { RouteMode } from '@/lib/constants/routes';
import type { ShortcutType } from '@/lib/types/shortcuts';
import type { ProxyRow } from '@/lib/repositories/proxies';
import type { RedirectRow } from '@/lib/repositories/redirects';
import type { CacheRow } from '@/lib/repositories/caches';
import type { OriginalRow } from '@/lib/repositories/originals';

export interface ConfigMap {
  proxies: ProxyRow;
  redirects: RedirectRow;
  caches: CacheRow;
  originals: OriginalRow;
}

export interface RouteParams {
  type: string;
  slug: string[];
}

export interface RouteHandlerContext {
  params: Promise<RouteParams>;
}

export interface RouteMatch {
  type: RouteMode;
  pathname: string;
}

export interface RouteRequest {
  req: Request;
  params: RouteParams;
}

export interface ConsumerRequest {
  req: Request;
  params: RouteParams;
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
  method: ProxyRow['method'];
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

export interface RouteContext<K extends RouteMode> {
  req: Request;
  params: RouteParams;
  pathname: string;
  config: ConfigMap[K];
  now: Date;
  parameters: Parameters | null;
  outbound: OutboundRequest | null;
  upstream: Response | null;
  snapshot: CacheSnapshot | null;
  response: Response | null;
}

export type Next = () => Promise<void>;
export type Middleware<K extends RouteMode> = (context: RouteContext<K>, next: Next) => Promise<void>;
export type ForwardMode = 'proxies' | 'caches';

export interface ConsumerMiddleware<K extends RouteMode> {
  request: readonly Middleware<K>[];
  response: readonly Middleware<K>[];
}

export interface RouteConsumer<K extends RouteMode> {
  readonly mode: K;
  handle(input: ConsumerRequest): Promise<Response>;
}

export interface ProxyRouteConsumer extends RouteConsumer<'proxies'> {
  request(outbound: OutboundRequest): Promise<Response>;
}

export interface CacheRouteConsumer extends RouteConsumer<'caches'> {
  invalidate(config: CacheRow): Promise<void>;
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
```

`parameters` 由公共请求链填写；`outbound` 仅由转发模式的请求链填写；`upstream` 由代理业务终端填写；`snapshot` 由缓存业务终端填写。各阶段使用前检查必需数据，不使用非空断言绕过前置条件。配置、时间与入口请求为只读语义；上下文只在单次请求内共享。消费实例可以复用，但不能将 req、config、context、response 或 dispatcher 放入实例字段；实例只保存固定中间件与必要的并发控制状态。

## 入口、分发与模式签名

### `app/[type]/[...slug]/route.ts`

等待异步 params 后先按完整路径匹配已启用的路由别名，再按需加载并调用对应 service；业务与传输异常由对应消费类收口为 Response。使用 Node.js 运行时，GET 不进入框架静态缓存；项目已开启 Cache Components，不添加与其冲突的 `dynamic`、`revalidate` 配置。文件只保留入口适配，不查询数据库。

```ts
export declare const runtime: 'nodejs';
export declare function GET(req: Request, ctx: RouteHandlerContext): Promise<Response>;
export declare function POST(req: Request, ctx: RouteHandlerContext): Promise<Response>;
```

路由模块只导出 GET、POST 处理方法。

入口上下文复用 `lib/types/route.ts` 的 `RouteHandlerContext`，params 为异步参数。`[...slug]` 至少匹配一段，不支持模式根路径。路由别名前缀由 shortcuts service 从服务端全局配置解析：默认值在 `lib/constants/shortcuts.ts` 初始化，由 instrumentation 在 Node.js 服务启动时加载持久化设置并覆盖默认值；设置页保存或删除成功后刷新全局配置，后续请求直接读取该配置；按路径段边界匹配，多个前缀匹配时选择最长前缀。剥离别名前缀后的 pathname 保留前导 `/`，用于对应模式的精确配置查询；不重复解码路径片段。

### `lib/services/routes/index.ts`

保持现有配置管理方法及默认对象，不增加交付分发。交付类型识别与 service 选择由 API 入口完成；pathname 合法性由对应消费类校验。

### `instrumentation.ts` 与 `lib/context.ts`

```ts
// instrumentation.ts
export declare function register(): Promise<void>;

// lib/context.ts
export declare function getAppContext(): Readonly<AppContext>;
export declare function setAppConfig(config: ApplicationConfig): void;
```

register 仅在 Node.js 运行时动态加载配置服务，在开始处理请求前读取数据库并注入应用上下文 ctx。上下文以 `lib/constants/shortcuts.ts` 的默认前缀初始化，数据库未配置的类型保留默认值；启动读取失败时保留默认配置并输出固定警告，不泄露数据库或凭据细节。

通过 `const ctx = getAppContext()` 获取服务端进程共享上下文，访问 `ctx.config.shortcuts`。getAppContext 只读取内存，不触发数据库查询；同一进程内 ctx 对象身份稳定。保存设置后替换 ctx.config 的只读快照，已有 ctx 引用也能访问新配置。

### `lib/services/config.ts`

```ts
export declare function refresh(): ApplicationConfig;
```

refresh 加载持久化设置、合并默认值，通过 setAppConfig 注入上下文；由启动入口和设置保存、删除操作调用。进程重启后在启动阶段从数据库恢复，不推迟至首次路由请求。上下文作用域为当前服务端进程，多进程部署需另行同步刷新，不将单进程内存视为跨进程共享存储。

### 列表地址与设置同步

后台布局通过 ShortcutsProvider 使用 ctx.config.shortcuts 初始化浏览器共享 store，设置页与各路由列表使用同一实例。设置保存成功后，根据服务端返回值同步更新 store 中对应类型的 pathname 与 status；保存失败的类型保留原值。列表打开时直接读取最新 store 前缀，不为各页面创建独立配置副本。

完整访问地址由 useRouteUrl 按站点 origin、模式前缀、配置 pathname 拼接；四种列表的悬停地址和复制操作共用该钩子。配置 pathname 本身不写入模式前缀。

### `lib/services/shortcuts.ts`

```ts
export declare function resolve(pathname: string): RouteMatch | null;
```

通过 getAppContext().config.shortcuts 直接读取别名解析公开访问前缀，返回路由模式及剥离前缀后的 pathname；停用或未匹配返回 null。别名到路由模式的映射统一定义在 `lib/constants/shortcuts.ts`，API 层不使用后台模块名匹配公开访问前缀。

### 四种模式 service 模块

`lib/services/routes/{proxies|redirects|caches|originals}.ts` 保留现有 CRUD；分别具名导出 handle 并加入默认对象。handle 仅调用对应消费实例，不重新声明中间件顺序。caches service 的配置更新和删除调用 caches.invalidate，传入变更前配置，使旧缓存失效。

```ts
// 四个 service 文件分别声明
export declare function handle(input: ConsumerRequest): Promise<Response>;
```

### `consumers/proxies.ts`

```ts
declare class ProxyConsumer implements ProxyRouteConsumer {
  readonly mode: 'proxies';
  constructor();
  use(options: ConsumerMiddleware<'proxies'>): this;
  handle(input: ConsumerRequest): Promise<Response>;
  request(outbound: OutboundRequest): Promise<Response>;
  private execute(context: RouteContext<'proxies'>, next: Next): Promise<void>;
  private run(context: RouteContext<'proxies'>): Promise<Response>;
}

export declare const proxies: ProxyRouteConsumer;
export default proxies;
```

request 是该消费类公开的远程请求能力，CacheConsumer 通过 proxies.request 复用；不调用 proxies.handle，避免重复路由查找或执行代理模式的整条中间件链。使用 Undici fetch 跟随重定向，保留标准方法转换与跨源凭据处理，不进入 Next.js 数据缓存；设置整体超时并关联入口取消信号。远程 HTTP 4xx/5xx 作为结果交付，网络或重定向失败转换为 502，超时转换为 504。

### `consumers/redirects.ts`

```ts
declare class RedirectConsumer implements RouteConsumer<'redirects'> {
  readonly mode: 'redirects';
  constructor();
  use(options: ConsumerMiddleware<'redirects'>): this;
  handle(input: ConsumerRequest): Promise<Response>;
  private execute(context: RouteContext<'redirects'>, next: Next): Promise<void>;
  private run(context: RouteContext<'redirects'>): Promise<Response>;
}

export declare const redirects: RouteConsumer<'redirects'>;
export default redirects;
```

### `consumers/caches.ts`

```ts
declare class CacheConsumer implements CacheRouteConsumer {
  readonly mode: 'caches';
  constructor();
  use(options: ConsumerMiddleware<'caches'>): this;
  handle(input: ConsumerRequest): Promise<Response>;
  invalidate(config: CacheRow): Promise<void>;
  private execute(context: RouteContext<'caches'>, next: Next): Promise<void>;
  private run(context: RouteContext<'caches'>): Promise<Response>;
  private createKey(config: CacheRow): CacheKey;
  private refresh(context: RouteContext<'caches'>, key: CacheKey): Promise<CacheSnapshot>;
  private snapshot(response: Response): Promise<CacheSnapshot>;
  private encode(snapshot: CacheSnapshot): Uint8Array;
  private decode(value: Uint8Array): CacheSnapshot | null;
  private seconds(ttl: number): number | undefined;
}

export declare const caches: CacheRouteConsumer;
export default caches;
```

### `consumers/originals.ts`

```ts
declare class OriginalConsumer implements RouteConsumer<'originals'> {
  readonly mode: 'originals';
  constructor();
  use(options: ConsumerMiddleware<'originals'>): this;
  handle(input: ConsumerRequest): Promise<Response>;
  private execute(context: RouteContext<'originals'>, next: Next): Promise<void>;
  private run(context: RouteContext<'originals'>): Promise<Response>;
}

export declare const originals: RouteConsumer<'originals'>;
export default originals;
```

各类 handle 创建本次请求的上下文，并由 run 执行已注册的请求链、本类 execute、响应链；execute 按实例绑定，保留 this。失败时捕获符合 DeliveryError 结构的业务异常或未知异常，以固定公开文案构造 Response；不暴露远程地址、代理凭据与异常栈。已加载配置的代理与缓存消费类对错误响应应用对应 CORS 策略。

### 实例配置与导出

每个消费模块 import 对应 middleware，在模块内按下列签名式配置关系创建实例并调用 use，再导出配置后的实例。实例变量名、具名导出名与默认导出对象统一为 proxies、caches、redirects、originals；消费类仅在模块内定义，不额外导出类。以下只描述实例配置，不展开方法实现：

```text
proxies = new ProxyConsumer().use({
  request: [requestParameters(), requestAuthorize(), requestExpired(),
            requestOutbound(), requestHeaders(), requestProxy()],
  response: [responseProxy(), responseCors()]
})
redirects = new RedirectConsumer().use({
  request: [requestParameters(), requestAuthorize(), requestExpired()],
  response: [responseRedirect()]
})
caches = new CacheConsumer().use({
  request: [requestParameters(), requestAuthorize(), requestExpired(),
            requestOutbound(), requestHeaders(), requestProxy()],
  response: [responseCache(), responseCors()]
})
originals = new OriginalConsumer().use({
  request: [requestParameters(), requestAuthorize(), requestExpired()],
  response: [responseOriginal()]
})
```

导出的实例使用公共消费接口收窄类型，不暴露 use 和私有执行方法；后续调用方只传本次请求。构造与 use 不连接 Redis、不请求网络、不查询数据库。消费模块互相引用时直接引用具体模块；CacheConsumer 引用 proxies 模块，避免通过聚合索引形成循环依赖。

### `consumers/index.ts`

```ts
export { proxies } from './proxies';
export { redirects } from './redirects';
export { caches } from './caches';
export { originals } from './originals';
```

该索引只聚合实例，保留原始名称。业务使用层按需通过 as 声明别名，不修改消费模块的导出名称；现有 routes/index 的管理分发与 CRUD 接口保持原结构。

```ts
import { proxies as proxyConsumer, caches as cacheConsumer } from './consumers';
import { proxies as proxyConsumer } from './consumers/proxies';
```

以上为两种按需导入方式，调用方择一使用；消费模块内部相互引用时使用具体模块路径。

## 中间件模块签名

### `request.parameters.ts`

```ts
export declare function parameters<K extends RouteMode>(): Middleware<K>;
export declare function outbound<K extends ForwardMode>(): Middleware<K>;
declare function parse(req: Request, params: RouteParams): Promise<Parameters>;
declare function parseQuery(search: string): QueryData;
declare function parseBody(req: Request): Promise<ParsedBody>;
declare function parseConfiguredBody(config: ProxyRow | CacheRow): string | null;
```

`parameters` 先 `req.clone()`，只读取副本；原始 req 保持未消费。GET 的 body 为 null；POST 按 Content-Type 解析 JSON、urlencoded、multipart、text，空体为 null，未识别类型保留 Uint8Array。重复 query 保留数组；JSON 结果从 unknown 校验为 JsonValue。解析失败返回 400，超过统一大小限制返回 413。

`outbound` 在 authorize、expired 后及 headers、proxy 前执行，仅用于 proxies、caches。该步骤创建 OutboundRequest：配置 GET 不携带 body；POST 按 JSON、TEXT、FORM 序列化，FORM 约定配置字符串为 urlencoded，不从入口 multipart 自动转换。配置 JSON 解析同样使用 npm 包。

### `request.headers.ts`、`request.proxy.ts`

```ts
// request.headers.ts
export declare function headers<K extends ForwardMode>(): Middleware<K>;
declare function resolve(config: ProxyRow | CacheRow): Headers;

// request.proxy.ts
export declare function proxy<K extends ForwardMode>(): Middleware<K>;
declare function resolve(address: string | null): Dispatcher | undefined;
```

headers 复用 `lib/shared/headers.ts` 校验后的配置结构，头名不区分大小写；按 format 补充默认 Content-Type，显式配置优先。移除 Host、Content-Length、逐跳头，由传输库生成正确值。proxy 为空时直连，否则创建 HTTP/HTTPS ProxyAgent；不调用 setGlobalDispatcher，资源释放与响应流完成、失败、取消绑定，不能在读取响应体前关闭代理。缓存命中或异常等未执行远程请求的路径同样释放已创建的代理资源，由对应消费类收口。

### `request.authorize.ts`、`request.expired.ts`

```ts
// request.authorize.ts
export declare function authorize<K extends RouteMode>(): Middleware<K>;
declare function verify(expected: string | null, query: QueryData): boolean;

// request.expired.ts
export declare function expired<K extends RouteMode>(): Middleware<K>;
declare function isExpired(expiredAt: Date | null, now: Date): boolean;
```

未配置 token 时放行，否则执行字符串令牌比较；过期边界为 `now >= expiredAt`。所有模式在业务终端前完成校验，缓存命中也不能跳过。

### 响应中间件

```ts
// response.cors.ts
export declare function cors<K extends ForwardMode>(): Middleware<K>;
export declare function apply(req: Request, response: Response, cors: ProxyRow['cors']): Response;

// response.proxy.ts
export declare function proxy(): Middleware<'proxies'>;
export declare function create(upstream: Response): Response;
export declare function sanitize(headers: Headers): Headers;

// response.redirect.ts
export declare function redirect(): Middleware<'redirects'>;
declare function create(config: RedirectRow): Response;

// response.cache.ts
export declare function cache(): Middleware<'caches'>;
declare function create(snapshot: CacheSnapshot): Response;

// response.original.ts
export declare function original(): Middleware<'originals'>;
declare function create(config: OriginalRow): Response;
```

proxy 使用 upstream；cache 使用 snapshot；redirect、original 使用 config。它们填写 context.response。远程与缓存响应构造复用 response.proxy 的 sanitize；cors 在响应构造后执行，不改变内容。sanitize 移除逐跳头、Connection 指定的头，以及解压后失效的 Content-Encoding、Content-Length；保留合法端到端响应头和多条 Set-Cookie，不将二进制转为文本，无内容状态返回空体。缓存保存 CORS 处理前的响应。

cors=1 时设置 `Access-Control-Allow-Origin: *`，不启用 credentials；cors=0 不输出 CORS 头；cors=-1 保留远程 CORS 头。仅处理 GET、POST 的响应头。

### `middleware/index.ts`

仅具名导出中间件；request、response 同名动作通过别名区分，不增加模式业务逻辑。

```ts
export { parameters as requestParameters, outbound as requestOutbound } from './request.parameters';
export { headers as requestHeaders } from './request.headers';
export { proxy as requestProxy } from './request.proxy';
export { authorize as requestAuthorize } from './request.authorize';
export { expired as requestExpired } from './request.expired';
export { cors as responseCors, apply as applyCors } from './response.cors';
export { proxy as responseProxy } from './response.proxy';
export { redirect as responseRedirect } from './response.redirect';
export { cache as responseCache } from './response.cache';
export { original as responseOriginal } from './response.original';
```

## Redis 服务与缓存边界

### `lib/services/redis.ts`

```ts
export declare function get(key: string): Promise<Uint8Array | null>;
export declare function set(key: string, value: Uint8Array, options?: RedisSetOptions): Promise<void>;
export declare function remove(key: string): Promise<void>;
export declare function close(): Promise<void>;
```

方法具名导出并通过默认对象聚合。该服务负责读取环境配置、惰性连接、连接复用、二进制读写、过期参数及有限时长的重连与命令等待，不处理路由配置、缓存键规则或 HTTP 响应。客户端实例仅在该模块内部使用，业务服务不直接操作 Redis 客户端。服务在服务端运行，不启用浏览器或客户端本地缓存。

`.env` 使用 `REDIS_URL` 配置服务套接字，例如 `REDIS_URL=redis://127.0.0.1:6379/0`，TLS 使用 rediss；Unix socket 通过该客户端支持的 unix 连接 URL 配置。该变量不能使用 NEXT_PUBLIC 前缀，凭据不进入文档或日志。连接方式依据 [node-redis 配置](https://github.com/redis/node-redis/blob/master/docs/client-configuration.md)。

CacheConsumer 经 Redis service 读写服务端缓存，不经数据库 repository 访问 Redis。缺少连接配置属于配置错误；运行时 Redis 不可用则跳过缓存并回源，读写失败不阻断已成功获取的远程响应，禁止静默切换为文件缓存。

### `lib/services/routes/consumers/caches.ts` 的缓存业务

缓存保存完整字节、最终状态及必要响应头，不能仅依赖 cachedAt。execute 在公共鉴权后通过 redis.get 读取缓存；命中则还原快照，缺失或失效则复用 proxies.request 获取远程结果。快照编码、解码与缓存资格判断位于 CacheConsumer，不进入 Redis 通用服务或 response.cache。

CacheRecord 使用 JSON 元数据与 Base64 字节表示，解码时校验结构并恢复 Uint8Array、Date；损坏数据视为未命中。单条 Redis value 保存完整快照，使用单条 SET 同时写入 value 和过期时间，不拆成 SET 后 EXPIRE。

配置 ttl 从天换算为正整数秒；ttl=0 时不设置过期时间，表示 Redis 不主动按时间淘汰，仍可能因内存策略或服务数据丢失而未命中。以成功写入时刻作为 cachedAt，ttl 仅决定服务端有效期，不生成浏览器缓存策略，也不启用 Next.js 数据或静态响应缓存。

只保存完整读取的 2xx 响应；206、带 Set-Cookie、Cache-Control: private/no-store 或 Vary: * 的响应直接交付但不缓存；其他非成功响应同样不缓存。回源失败返回当前错误，不默认交付过期数据。无论是否符合缓存资格，响应均由 response.cache 使用当前请求的 snapshot 交付。

缓存 key 使用固定前缀、路由 id 和配置版本摘要，版本包含 updatedAt 与影响远程请求的配置；不含入口 token 或未使用的入口参数。配置变更后旧版本不再命中，旧刷新任务只能写旧版本，不能覆盖新版本。永久缓存的旧 key 在配置更新或删除后由 caches service 调用 caches.invalidate，再由消费类调用 redis.remove 清理；回源完成后复核版本，已变更则不写入。删除与旧请求写入的并发仍可能留下不可命中的旧 key，批量清理策略不属于此最小读写接口。

CacheConsumer 在单进程内按 key 合并并发回源，多实例允许重复回源；Redis 单条写入保证不暴露半写入快照。命中前仍以当前数据库配置检查 status、token、expiredAt。

### `lib/repositories/caches.ts`

```ts
export declare function markCached(id: string, updatedAt: Date, cachedAt: Date): boolean;
```

仅在 Redis 写入成功且配置版本仍匹配时更新 cachedAt，不修改 updatedAt，不复用配置更新方法。Redis value 与其 TTL 是缓存有效性的依据，数据库 cachedAt 仅为管理展示数据。Redis 写入失败不更新 cachedAt。

## 解析与网络依赖

以下为拟新增依赖，仅在开始实施后安装；类型声明包按实际需要引入。

| npm 包                                                      | 使用边界                                                                  |
| ----------------------------------------------------------- | ------------------------------------------------------------------------- |
| [qs](https://github.com/ljharb/qs#readme)                   | query 与配置 FORM 的解析、序列化；保留重复值并限制深度、数量              |
| [co-body](https://github.com/cojs/co-body#readme)           | JSON、urlencoded、text 解析；配置字符串也适配为流后解析，不手写对应解析器 |
| [busboy](https://github.com/mscdex/busboy#readme)           | multipart 字段与文件解析，设置字段、文件及总体大小限制                    |
| [Undici](https://github.com/nodejs/undici#readme)           | fetch、重定向与 HTTP/HTTPS 代理 dispatcher                                |
| [raw-body](https://github.com/stream-utils/raw-body#readme) | 请求字节读取与统一大小限制                                                |
| [redis](https://github.com/redis/node-redis#readme)         | Redis 服务连接、二进制读写与服务端 TTL                                    |

Web Request 的克隆体通过 Node.js 流适配传给解析包，携带 Content-Type 等解析所需元数据；原始编码长度不能直接用于已解码的数据流。文件不落临时磁盘，受大小限制后转换为 File。配置 headers 沿用已有结构校验工具。具体限制值集中声明在解析模块，不散落到各模式中。
