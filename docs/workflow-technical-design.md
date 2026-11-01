# Flow 工作流与节点扩展技术方案

本方案定义工作流的数据模型、节点契约、类型适配、画布编排、保存恢复、执行调度及节点扩展要求。

## 1. 总体结构

```ts
interface WorkflowDefinition {
  id: string;
  version: number;
  nodes: NodeInstance[];
  edges: FlowEdge[];
}

interface NodeInstance<C = unknown> {
  id: string; // 画布实例唯一 ID
  type: string; // 节点实现的全局唯一类型键
  name: string; // 实例显示名称，可编辑
  config: C; // 实例配置
  definitionVersion: number; // 节点实现版本
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
}
```

目录约定：

```text
app/page.tsx                         # 页面状态、工具栏、保存与运行操作
components/workflow/                 # 画布、节点视图、配置弹窗、拖拽 hooks
lib/workflow/
  model/                             # Workflow、实例、连线与快照模型
  nodes/
    types.ts                         # 节点、端口、解析器、运行上下文契约
    core/                            # defineNode、节点注册、类型匹配等核心能力
    subscription/                    # 订阅节点组
      index.ts                       # 默认导出组内所有 node 的列表
      client.ts                      # 前端配置表单与节点视图入口
      parse/                         # 一个具体 node
        types.ts                     # 该节点的输入、配置、输出类型
        definition.ts                # 名称、类型、输入输出描述
        schema.ts                    # 输入、输出、配置的数据校验
        parser.ts                    # 参数解析与多输入组装
        executor.ts                  # 后端处理逻辑
        pages/                       # 节点前端视图
          config.tsx                 # 配置表单
          view.tsx                   # 展示内容与尺寸
          index.ts                   # 组装并导出 NodeView<C>
        client.ts                    # 导出 pages 中的节点视图
        index.ts                     # 组装并导出后端 node
      filter/
      rename/
    common/                          # 合并、追加等通用 node
      index.ts
      client.ts
  engine/                            # 流程校验、依赖解析、执行调度
  runtime/                           # 运行实例、状态、取消、SSE 通信
  utils/                             # 与具体节点无关的公共工具
```

- 节点契约集中在 `nodes/types.ts`，注册、类型匹配及节点创建能力集中在 `nodes/core`，具体实现放入节点组目录。
- `utils` 放 JSON 处理、通用序列化、ID 等无业务依赖的工具；流程模型、图校验和执行器保留在所属模块。
- 模块按能力划分：单模块使用文件，多模块使用目录；目录通过 `index.ts` 统一导出。
- `pages` 是节点内部视图目录。配置表单模块为 `config.tsx` 或 `config/`，节点展示模块为 `view.tsx` 或 `view/`；目录形式适用于包含多个组件或样式模块的实现，统一以 `index.ts` 为入口。
- `components/workflow` 仅负责交互和渲染；业务节点处理统一在后端执行。

## 2. 通用数据类型与运行时校验

```ts
// 可序列化的类型描述，用于画布连线和后端复核。
type TypeDescriptor =
  | { kind: 'any' }
  | { kind: 'string' | 'number' | 'boolean' | 'null' }
  | { kind: 'array'; items: TypeDescriptor }
  | { kind: 'record'; values: TypeDescriptor }
  | { kind: 'union'; types: TypeDescriptor[] }
  | { kind: 'ref'; id: string; version: number };

interface Parser<T> {
  parse(value: unknown): T; // 成功返回解析后的值，失败抛出明确错误
}

interface ValueSchema<T> extends Parser<T> {
  descriptor: TypeDescriptor;
}

interface NamedType<T> extends ValueSchema<T> {
  descriptor: { kind: 'ref'; id: string; version: number };
  base: TypeDescriptor; // 结构基础，如 Array<Record<string, unknown>>
}

function arrayOf<T>(item: ValueSchema<T>): ValueSchema<Array<T>>;
function recordOf<T>(value: ValueSchema<T>): ValueSchema<Record<string, T>>;
function unionOf<A, B>(a: ValueSchema<A>, b: ValueSchema<B>): ValueSchema<A | B>;
function isAssignable(source: TypeDescriptor, target: TypeDescriptor): boolean;
function registerType<T>(type: NamedType<T>): void;
```

类型分为两层：TypeScript 泛型约束开发代码；`descriptor + parse` 支持运行时判断和校验。TypeScript 的 `Array<T>`、`XxxNodeOutput` 名称在运行时不可直接读取，需要显式对应运行时描述。[TypeScript 官方说明](https://www.typescriptlang.org/docs/handbook/2/basic-types#erased-types)

| TypeScript 类型           | 运行时描述示例                                   |
| ------------------------- | ------------------------------------------------ |
| `string`                  | `{ kind: 'string' }`                             |
| `Array<string>`           | `{ kind: 'array', items: { kind: 'string' } }`   |
| `Record<string, number>`  | `{ kind: 'record', values: { kind: 'number' } }` |
| `Array<T>`                | 将已确定的 T 对应描述放入 `items`                |
| `string \| Array<string>` | `{ kind: 'union', types: [...] }`                |
| `XxxNodeOutput`           | `{ kind: 'ref', id: 'xxx.output', version: 1 }`  |
| `any`                     | `{ kind: 'any' }`                                |

`Array` 和 `Record` 必须说明元素/值类型；不限定时使用 `Array<unknown>`、`Record<string, unknown>`，运行时子项使用 `any` 描述。使用小写 `string`，不使用包装对象 `String`。

具体类型通过 `ref` 注册校验器和基础结构。例如 `XxxNodeOutput = Array<SubscriptionItem>`，其 ref 可以作为专门的节点输出类型，也可适配通用数组输入。

类型系统支持上表描述，不实现任意 TypeScript 类型反射，也不尝试完整推导任意 JSON Schema 的包含关系。数组元素和字典值需要独立校验，这与 [JSON Schema 的数组/对象建模](https://json-schema.org/understanding-json-schema/reference/type)一致。

## 3. 单个 node 的定义、解析与状态

```ts
interface InputPort<T> {
  schema: ValueSchema<T>; // 每条上游连线提供的数据类型
  required: boolean;
  multiple: boolean; // 是否允许多个上游
}

interface OutputPort<T> {
  schema: ValueSchema<T>; // 一次节点执行的输出类型
  multiple: boolean; // 是否允许多个下游
}

interface ExecutionContext {
  runId: string;
  nodeId: string;
  signal: AbortSignal;
}

interface NodeModule<I, C, O, RunInput = I> {
  type: string; // 如 subscription.rename，跨组不重复
  name: string; // 默认显示名称
  version: number;
  input: InputPort<I> | null;
  output: OutputPort<O> | null;
  configSchema: Parser<C>;
  defaultConfig: C;
  parseConfig(raw: unknown): C;
  parseInput(values: readonly I[], context: ExecutionContext): RunInput;
  execute(input: RunInput, config: C, context: ExecutionContext): Promise<O>;
}

type NodeStatus = 'pending' | 'running' | 'success' | 'failed' | 'cancelled' | 'skipped';
interface NodeRunState {
  runId: string;
  nodeId: string;
  status: NodeStatus;
  output?: unknown;
  error?: { code: string; message: string };
  startedAt?: number;
  finishedAt?: number;
}

function defineNode<I, C, O, R = I>(definition: NodeModule<I, C, O, R>): NodeModule<I, C, O, R>;
```

区分三个对象：`NodeModule` 定义能力；`NodeInstance` 是画布实例，持有唯一 id、名称和配置；`NodeRunState` 属于一次运行。状态不写回节点定义或长期保存的草稿。

输入输出使用泛型，并绑定 `ValueSchema<T>`：

- 普通文本节点可声明 `NodeModule<string, Config, string>`。
- 多来源节点可声明 `NodeModule<string, Config, string, string[]>`：每条连线接收 string，`parseInput` 将多条值组装为 string[]。
- 专用节点可声明 `NodeModule<XxxNodeOutput, Config, YxxNodeOutput>`，对应 schema 使用已注册的 ref。
- 来源节点 `input: null`，接收到的 values 为空，`parseInput` 返回来源执行所需的值；无输出节点使用 `output: null`。

解析与执行责任：

| 功能           | 责任                                                        |
| -------------- | ----------------------------------------------------------- |
| `schema.parse` | 验证每条输入、输出或配置的真实结构                          |
| `parseConfig`  | 调用配置 schema，补默认值、转换参数；正则等错误在执行前发现 |
| `parseInput`   | 组装已校验的上游值，明确单值、多输入或数组展开方式          |
| `execute`      | 仅处理已解析参数，遵守取消信号，返回约定输出                |

节点组内的名称可相似，但 `type` 必须全局唯一。实例 `id` 与 `type` 不同，同一种实现可以创建多个实例。

## 4. 画布编排、连线和配置

```ts
interface NodeManifest {
  type: string;
  name: string;
  version: number;
  input: { type: TypeDescriptor; required: boolean; multiple: boolean } | null;
  output: { type: TypeDescriptor; multiple: boolean } | null;
}

function canConnect(source: NodeManifest, target: NodeManifest): boolean;
function validateConnection(flow: WorkflowDefinition, edge: FlowEdge): void;
function updateNodeConfig<C>(nodeId: string, value: C): void;
```

### 4.1 连线判定

依次检查：节点存在 → 两端具有对应端口 → 数量未超限 → 类型兼容 → 非自连、非重复、不会成环。前端实时判断，后端使用相同规则独立校验。

类型兼容方向为“输出可赋给输入”，不检查节点名称或节点组名称：

| 上游输出 → 下游输入                            | 规则                                    |
| ---------------------------------------------- | --------------------------------------- |
| `string → string`                              | 允许                                    |
| `Array<string> → Array<string>`                | 允许，递归检查元素类型                  |
| `Array<string> → string`                       | 拒绝，不隐式取元素或拼接                |
| `Record<string, number> → Record<string, any>` | 允许，递归检查值类型                    |
| `T → any`                                      | 允许，但数据仍须满足传输格式约束        |
| `any → 具体类型`                               | 拒绝静态直连，需先经过显式转换/校验节点 |
| `A \| B → A`                                   | 拒绝，除非每个输出分支都被接受          |
| `A → A \| B`                                   | 允许匹配其中一个输入分支                |
| 相同 `ref` 和版本                              | 允许                                    |
| 具体 `ref → 通用结构`                          | 只沿注册的 base 判断是否兼容            |
| 通用结构 → 具体 `ref`                          | 拒绝隐式升级，需显式校验/转换节点       |

`ref A → ref B` 默认拒绝；不提供隐式类型转换或按形状猜测业务身份。编排开始前，所有泛型 T 都必须绑定到确定的描述；不能把未绑定的 T 当作 any。

合并节点若要继续接入专用过滤节点，应保留明确的元素类型，例如 `Array<SubscriptionItem>`；通用合并输出若为 `Array<any>`，应增加校验节点转换为专用输出后再连接。

### 4.2 画布交互

画布由 `@xyflow/react` 承载拖拽、连线、选中及视口交互；节点通过适配组件复用已有展示视图。持久化只使用工作流快照，不保存 React Flow 的内部节点数据、测量结果或选中状态。

1. 节点列表按分组读取 `NodeManifest`，使用统一列表样式；拖动预览与画布实例共用 display.Content。
2. 放下时将屏幕坐标转换为画布坐标，生成实例 id，复制默认配置，记录 type、name 和位置。
3. 单击选中，双击在弹窗中打开匹配 type 的配置表单。
4. 表单变更保留在弹窗编辑草稿中，点击保存后写入实例配置并同步节点展示视图；未填写完成的配置允许保存。
5. 表单可即时展示错误，后端 `parseConfig` 为最终执行依据。

`NodeManifest` 仅包含可序列化的能力描述，不带 execute 或服务端解析函数。前端不导入节点后端入口。

### 4.3 配置表单视图

```ts
interface ConfigIssue {
  path: readonly (string | number)[]; // 如 ['rules', 0, 'pattern']
  message: string;
}

interface NodeFormProps<C> {
  value: C; // 具有默认结构的配置草稿
  onChange(value: C): void; // 返回完整配置，统一替换当前草稿
  disabled: boolean;
  issues: readonly ConfigIssue[];
}

interface NodeConfigView<C> {
  Form: ComponentType<NodeFormProps<C>>;
}
```

节点实现配置表单，画布统一承载。自定义表单和配置化表单均通过 `Form` 接口接入，遵守相同的数据契约。动态规则列表、条件字段和特殊编辑器由节点实现，公共输入控件统一复用。

配置数据约定：

- 每个节点定义明确的 `Config` interface/type，供 `NodeModule`、配置表单和展示视图共同使用，禁止三处分别定义同名字段。
- `defaultConfig` 提供完整初始结构，每次新增实例时深拷贝；编辑中的空字符串、空数组等由 Config 明确表达，不使用 `Partial<C>` 表示任意缺字段。
- 配置仅保存 JSON 数据。数字等字段若需保留未完成的输入，Config 可定义为字符串，由 `parseConfig` 校验、转换；正则保存表达式文本，组件和函数不进入配置。
- 表单为受控组件，只通过 `value/onChange` 读写配置，不直接操作画布 store、localStorage 或执行器。数组编辑返回完整新数组，字段清空使用约定空值，避免局部合并残留数据。
- 弹窗统一提供容器、关闭和错误呈现；节点负责字段布局、说明及交互。弹窗提供固定底部操作区：保存将编辑草稿写入实例配置，取消或关闭丢弃本次修改。前端校验返回字段路径，后端仍须独立校验。

### 4.4 节点展示视图

```ts
interface NodeContentProps<C> {
  node: Readonly<NodeInstance<C>>;
  selected: boolean;
  status?: NodeStatus;
  mode: 'canvas' | 'palette' | 'drag-preview';
}

interface NodeDisplayView<C> {
  size: { width: number; height: number }; // 未缩放时的画布逻辑尺寸
  Content: ComponentType<NodeContentProps<C>>;
}

interface NodeView<C> {
  icon: ComponentType<{ className?: string }>;
  type: string; // 对应 NodeModule.type
  config: NodeConfigView<C>;
  display?: NodeDisplayView<C>;
}

function defineNodeView<C>(view: NodeView<C>): NodeView<C>;
```

单个节点通过前端入口提供配置视图和可选展示视图：`config.Form` 用于双击后的配置弹窗；`display.Content` 用于画布节点内及拖动预览的个性化内容。展示内容可根据配置渲染名称、摘要、图标或预览，由节点决定，不强制套用同一内容布局。

展示边界：

- 详情展示由画布统一开关控制；仅当开关开启且节点定义了 display 时展开。未定义 display 或关闭详情时与左侧节点预览使用同一展示组件，并读取节点前端定义的图标；端口与配置能力不受影响。
- 画布提供尺寸容器、选中状态、输入输出连接点和拖拽行为；Content 只负责容器内的内容，不自行创建连接点或修改节点位置。
- `size` 定义整个节点的宽高，使用未缩放的逻辑像素；内容区域填满容器，内边距由节点内容决定。展示内容限制在声明尺寸内，溢出由节点选择截断或内部滚动，不隐式撑大外框。
- 左侧列表使用统一样式，不渲染节点 Content，也不依赖节点视图注册。拖动预览和画布实例共用同一 Content 与 size；拖动预览使用待添加配置，画布实例使用实时配置。默认缩放下尺寸与效果保持一致。
- 配置变更立即重新渲染 Content，不需要执行节点。内容组件只读配置，网络请求和业务处理通过后端执行流程完成。
- 视图、组件和尺寸属于节点前端实现，不写入流程快照。恢复时按 type 查找视图并回填已保存配置。

前端类型中的 `ComponentType` 来自 React；`NodeView<C>` 与 `NodeModule<I, C, O>` 共享同一 Config 类型。前端入口仅导入配置类型和安全的公共校验模块，不导入 executor 或服务端依赖。

## 5. 保存与恢复

```ts
interface CanvasNode extends NodeInstance {
  position: { x: number; y: number };
}
interface FlowSnapshot {
  schemaVersion: number;
  workflowId: string;
  nodes: CanvasNode[];
  edges: FlowEdge[];
  viewport?: { x: number; y: number; zoom: number };
}

function serializeSnapshot(snapshot: FlowSnapshot): string;
function restoreSnapshot(raw: string): FlowSnapshot;
function migrateSnapshot(snapshot: unknown): FlowSnapshot;
```

保存流程：页面变化 → 延迟生成快照 → 序列化 → 写入 localStorage；手动保存前，前后端通过同一编排校验检查节点实现与版本、连线规则及必需输入；失败返回业务错误且不写入，前端通过 Toast 展示。编排校验不执行节点配置解析，配置草稿仍允许未填写完成。只保存实例、配置、布局、连线和版本，不保存函数、执行结果和瞬时选择状态。

恢复流程：读取 → 校验快照版本 → 按版本转换为目标结构 → 检查节点实现及连线 → 回填页面状态 → 开启自动保存。恢复结束前禁止自动保存，避免默认示例覆盖已保存数据。

未知节点或缺失实现应保留原始数据并显示不可用状态，不静默删除；版本迁移失败不覆盖原缓存。配置可以是未完成草稿，运行时再严格校验。

## 6. 校验、执行与状态同步

```ts
interface ExecutionPlan {
  nodes: NodeInstance[]; // 已校验配置的运行快照
  order: string[]; // 拓扑顺序
  incoming: Record<string, string[]>; // 有序上游节点 ID
}
interface RunRequest {
  runId: string;
  workflow: WorkflowDefinition;
}
type RunEvent =
  | { type: 'run.started'; runId: string }
  | { type: 'node.updated'; runId: string; node: NodeRunState }
  | { type: 'run.completed'; runId: string; outputs: Record<string, unknown> }
  | { type: 'run.failed' | 'run.cancelled'; runId: string; message: string };

function validateWorkflow(flow: WorkflowDefinition): void;
function buildExecutionPlan(flow: WorkflowDefinition): ExecutionPlan;
function executeFlow(plan: ExecutionPlan, context: { runId: string; signal: AbortSignal }): Promise<void>;
```

执行流程：

1. 后端校验所有节点是否注册、实现版本、连接规则及全部配置；保存 `parseConfig` 返回值到运行快照。
2. 构建拓扑顺序和上游索引；执行前冻结流程定义，运行期间的页面编辑不影响该运行实例。
3. 按拓扑顺序串行执行，多输入等待全部上游完成，按连线顺序收集。
4. 每条值先通过输入 schema，再交给 `parseInput` 组装，随后调用 execute。
5. 输出通过输出 schema 后缓存，更新 success；采用失败即停止策略，失败节点标记 failed，所有尚未执行的节点标记 skipped。
6. runtime 通过 SSE 推送事件，前端按 runId、nodeId 更新运行态；状态不回写配置。

参与快照和 SSE 传输的数据必须可 JSON 序列化，any 不允许传递函数、循环对象或 Blob；图片等资源通过 URL 或明确的数据结构传递。无输出端口时跳过输出校验，执行结果不传给下游。

节点允许返回空数组。多条连线与单条连线中的数组是两个概念，不自动展开数组。数组展开、文本拼接由对应 node 明确实现。

运行完成后按终点 ID 返回输出。停止、超时或断连取消由 runtime 统一控制；正在执行的异步处理必须响应 signal。同步 CPU 处理不能仅靠 AbortSignal 硬中断，耗时任务需要独立执行环境。

### 6.1 运行时接入边界

运行前先通过草稿接口按订阅 ID 保存当前流程快照到 `flowDraft`，成功后再提交订阅 ID 与运行标识启动执行。运行服务从对应订阅读取草稿并严格校验配置；草稿保存不覆盖正式 `flow`，运行请求不直接携带流程定义。草稿接口写入前校验快照结构、订阅归属，并沿用[保存与恢复](#5-保存与恢复)的 DAG 编排校验与错误反馈规则；节点配置允许未填写完成。

运行由 HTTP 接口启动与取消。启动接口直接返回 SSE 流，事件名称为运行事件的 type，data 为完整事件的 JSON；使用支持 POST 的流式 fetch 消费，不使用原生 EventSource 自动重连，避免重复执行。参数或流程校验失败时返回统一 JSON 错误响应；流建立后以运行事件表示执行结果，终态事件发送后关闭流。

运行实例保存在 Next.js 服务进程内，SSE 断连、读取取消及运行超时均取消对应运行。启动响应头携带取消令牌，显式取消必须提交 runId 和该令牌；令牌仅授予取消该次运行的能力，不代替业务鉴权。运行状态不持久化、不提供事件回放，多进程部署须保持启动与取消请求的进程归属，或另行实现共享运行协调。

SSE 成功响应采用事件流协议，普通管理接口及流建立前的错误响应沿用 [API 规范](api.md)。入口代理须关闭事件流缓冲并允许长连接；鉴权沿用业务 API 入口配置。

执行请求中的节点实现版本由画布实例携带，后端与注册清单逐个比对；流程版本不代替节点实现版本。视图注册的结构守卫须接受未完成配置草稿，不代替执行配置校验。

快照存储在恢复、检查及状态回填之后显式激活自动保存；恢复或迁移失败时不得激活。未知节点的可用性检查不删除节点数据或连线。

## 7. 节点组的统一导出与接入

```ts
interface NodeGroup {
  id: string;
  name: string;
  nodes: readonly NodeManifest[];
}

interface RegisteredNode {
  manifest: NodeManifest;
  parseConfig(raw: unknown): unknown;
  run(values: readonly unknown[], config: unknown, context: ExecutionContext): Promise<unknown>;
}

function registerNode<I, C, O, R>(node: NodeModule<I, C, O, R>): void;
function registerNodeView<C>(view: NodeView<C>, isConfig: (value: unknown) => value is C): void;
function getNode(type: string): RegisteredNode;
```

`RegisteredNode` 是注册中心对不同泛型节点做类型封装后的内部表示；其 run 包装器必须调用原节点的 schema 和 parser，不允许调用方通过 any 绕过输入输出校验。

每个节点的 `index.ts` 组装 definition、schema、parser、executor 模块，导出一个后端 node；`pages/index.ts` 组装 config 和 view，节点的 `client.ts` 导出该 NodeView。

组目录的 `index.ts` 默认导出所有后端节点列表，并具名导出满足 `NodeModuleGroup` 的 `group`；分组包含组信息、完整节点列表和所需专用类型。`nodes/index.ts` 仅引用组入口，通过 `registerNodeGroup` 逐组注册；节点端口的类型引用在读取注册结果时校验，确保跨组类型依赖不受展示顺序影响，不在全局入口引用或逐个注册子节点。前端视图由组目录的 `client.ts` 独立导出。开发模式下重复注册更新已有节点、类型与组内清单，并将节点组移至当前注册顺序的末尾；其他模式保留重复注册校验。

组的节点数量可以为一个或多个。组是导出和画布列表的组织方式，本身不是可执行节点。

节点组按注册调用顺序展示，组内节点按注册分组时传入的节点数组顺序展示。调整对应顺序即可调整列表排列；接口本地化与前端展示须保留该顺序，不按名称或标识重新排序。

接入步骤：

| 步骤      | 要完成的内容                                                                         |
| --------- | ------------------------------------------------------------------------------------ |
| 定义类型  | 声明输入、配置、输出泛型；具体输出类型按需注册 ref                                   |
| 实现 node | 提供唯一 type、默认 name、端口、schema、参数解析及 execute                           |
| 实现视图  | 提供 config.Form、display.Content 和 size，共享 Config 类型，通过 type 对应后端 node |
| 组内导出  | 加入组的默认节点列表及 client 视图入口                                               |
| 全局注册  | 启动时注册节点、类型和视图；重复 type 或缺少 ref 校验器立即报错                      |
| 生成清单  | 从注册结果生成 NodeManifest，画布按组展示；禁止手工维护另一套连线规则                |

例如过滤节点可以接收 `Array<XxxNodeOutputItem>`，输出同类型数组；重命名节点可以接收某个注册的 `XxxNodeOutput`，输出 `YxxNodeOutput`。只要上下游描述兼容且运行时校验通过，就能接入同一画布，无需在页面增加节点专用判断。

## 8. 实现要求

- 节点定义、实例和运行状态分别建模；id、type、name 含义明确。
- TS 泛型和运行时描述对应，Array/Record 的元素类型不会丢失。
- 连线验证前后端一致，未绑定泛型、any 和具体 ref 的边界明确。
- 配置草稿可保存，执行配置必须完成解析；表单与后端使用同一约束来源。
- 配置表单与节点内容视图共享 Config 类型；画布统一承载弹窗、尺寸及连接点。
- 节点组默认导出全部 node 列表，画布清单由注册信息产生。
- 快照只保存数据，恢复前不自动保存；迁移失败不覆盖原数据。
- 后端完成业务处理，SSE 只同步状态，取消和失败能够结束本次运行。
