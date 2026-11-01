# Flow 工作流与节点扩展技术方案

本方案定义工作流的数据模型、节点契约、类型适配、画布编排、保存恢复、执行调度及节点扩展要求。

## 1. 总体结构

工作流模型、画布交互、执行引擎与运行通信分别维护在所属模块。节点目录、模块依赖和前后端边界遵守[工作流节点开发技能](skills/workflow-node/SKILL.md)的“单节点目录与依赖”约定。

## 2. 通用数据类型与运行时校验

节点数据契约、运行时校验及类型兼容约束统一见[工作流节点开发技能](skills/workflow-node/SKILL.md)的“数据契约与解析执行”。实际类型与核心能力以源码为准。

## 3. 单个 node 的定义、解析与状态

节点定义、实例、运行状态的边界及解析执行职责统一见[工作流节点开发技能](skills/workflow-node/SKILL.md)。

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

类型兼容约束统一见[工作流节点开发技能](skills/workflow-node/SKILL.md)的“数据契约与解析执行”。

### 4.2 画布交互

画布由 `@xyflow/react` 承载拖拽、连线、选中及视口交互；节点通过适配组件复用已有展示视图。持久化只使用工作流快照，不保存 React Flow 的内部节点数据、测量结果或选中状态。

1. 节点列表按注册分组读取清单，使用统一列表样式；节点视图遵守[工作流节点开发技能](skills/workflow-node/SKILL.md)。
2. 放下时将屏幕坐标转换为画布坐标，生成实例 id，复制默认配置，记录 type、name 和位置。
3. 单击选中，双击在弹窗中打开匹配 type 的配置表单。
4. 表单变更保留在弹窗编辑草稿中，点击保存后写入实例配置并同步节点展示视图；未填写完成的配置允许保存。
5. 表单可即时展示错误，后端 `parseConfig` 为最终执行依据。

清单及前端依赖边界见[工作流节点开发技能](skills/workflow-node/SKILL.md)的“注册与版本”。

### 4.3 配置表单视图

配置草稿、表单交互与校验边界统一见[工作流节点开发技能](skills/workflow-node/SKILL.md)的“配置与视图”。

### 4.4 节点展示视图

节点展示、尺寸、前端依赖与画布承载边界统一见[工作流节点开发技能](skills/workflow-node/SKILL.md)的“配置与视图”。

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

数据传输、端口与输入组装约束见[工作流节点开发技能](skills/workflow-node/SKILL.md)的“数据契约与解析执行”；无输出端口时，执行结果不传给下游。

运行完成后按终点 ID 返回输出。停止、超时或断连取消由 runtime 统一控制；节点的取消处理边界见[工作流节点开发技能](skills/workflow-node/SKILL.md)。

### 6.1 运行时接入边界

运行前先通过草稿接口按订阅 ID 保存当前流程快照到 `flowDraft`，成功后再提交订阅 ID 与运行标识启动执行。运行服务从对应订阅读取草稿并严格校验配置；草稿保存不覆盖正式 `flow`，运行请求不直接携带流程定义。草稿接口写入前校验快照结构、订阅归属，并沿用[保存与恢复](#5-保存与恢复)的 DAG 编排校验与错误反馈规则；节点配置允许未填写完成。

运行由 HTTP 接口启动与取消。启动接口直接返回 SSE 流，事件名称为运行事件的 type，data 为完整事件的 JSON；使用支持 POST 的流式 fetch 消费，不使用原生 EventSource 自动重连，避免重复执行。参数或流程校验失败时返回统一 JSON 错误响应；流建立后以运行事件表示执行结果，终态事件发送后关闭流。

运行实例保存在 Next.js 服务进程内，SSE 断连、读取取消及运行超时均取消对应运行。启动响应头携带取消令牌，显式取消必须提交 runId 和该令牌；令牌仅授予取消该次运行的能力，不代替业务鉴权。运行状态不持久化、不提供事件回放，多进程部署须保持启动与取消请求的进程归属，或另行实现共享运行协调。

SSE 成功响应采用事件流协议，普通管理接口及流建立前的错误响应沿用 [API 规范](api.md)。入口代理须关闭事件流缓冲并允许长连接；鉴权沿用业务 API 入口配置。

节点实现版本及草稿结构守卫的要求见[工作流节点开发技能](skills/workflow-node/SKILL.md)。

快照存储在恢复、检查及状态回填之后显式激活自动保存；恢复或迁移失败时不得激活。未知节点的可用性检查不删除节点数据或连线。

## 7. 节点组的统一导出与接入

节点及节点组的导出、注册、清单、展示顺序与版本约束统一见[工作流节点开发技能](skills/workflow-node/SKILL.md)的“注册与版本”。

## 8. 实现要求

节点扩展要求统一见[工作流节点开发技能](skills/workflow-node/SKILL.md)。工作流快照只保存数据；恢复完成前不自动保存，迁移失败不覆盖原数据。业务处理在后端完成，SSE 负责状态同步，取消和失败必须结束对应运行。
