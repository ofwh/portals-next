# Shadowsocks 输出

## 输入与模式

输入三要素为 `RuleSetConfigFields[]`、`PolicyConfigFields[]`、`ExtractNodesOutput`，引用[公共契约](../README.md#输出公共契约目标)。本目标只交付节点；现有 [SSProvider](../../../lib/subconverter/providers/ss/index.ts) 的配置形态与 SCE 同名目标分开建模。

```ts
interface SSOptions extends NodeOnlyOptions {
  mode: 'json' | 'sce-links';
  linkEncoding: 'plain' | 'base64';
}
type SSInput = OutputInput<null, SSOptions>;
interface SSNodeProjection {
  nodes: SSNode[];
  links: string[];
}
```

## 三要素处理

节点：现有 SSProvider 处理 JSON，transform('node') 只接受 ss；SSNode 的内部 serverPort/pluginOpts 在原生 JSON 中需投影 server_port/plugin_opts。现有 SSConfig 支持数组、servers、configs 等形态；目标 JSON 模式明确选择节点数组，避免依赖输入包装形状。

策略：本格式没有策略组区域；非空 policies 按 nonNodeElements 拒绝或显式忽略，不展开 reference、selector、providers。

规则：本格式没有路由规则区域；非空 rules 按同一选项处理，不下载远程规则、不生成兜底动作。节点的 group/remarks 是元数据，不等于 PolicyConfigFields[]。

## 原生投影及最终结构

JSON 模式输出 SSProxyNode 的原生字段数组；SCE 同名 ss 则调用 proxyToSingle 输出 ss:// 链接，通常对整段链接做 Base64。SCE 还可能将满足条件的 SSR 作为 SS 表达，这不是现有 SSProvider 已支持的协议。simple-obfs/obfs-local 名称按所选目标转换，不能原样混用。

```ts
type SSJsonNode = NativeObject & {
  server: string;
  server_port: number;
  method: string;
  password: string;
  remarks?: string;
  plugin?: string;
  plugin_opts?: string;
};
type SSDocument = SSJsonNode[] | { links: string[]; encoding: 'plain' | 'base64' };
type SSArtifact = ConfigArtifact<SSDocument>;
```

现有 `SSNode` 的完整字段见[源码类型](../../../lib/subconverter/types/providers/ss/index.ts)，以上 NativeObject 只用于原生字段投影后的线格式，不能绕过对应协议校验。中间节点转换后再分别进行 JSON 字段投影或链接编译；links 文档结构描述文本序列化前的载荷，不是把包装对象序列化成订阅。

JSON 模式输出 `application/json`；链接模式先以换行连接，再按 linkEncoding 决定是否整体 Base64，输出 `text/plain`。URL 编码、链接内部 Base64 与订阅外层 Base64 分开执行。过滤节点后检查依赖，不使用输入 raw 字符串绕过字段更新。

```mermaid
flowchart TD
    P[PolicyConfigFields 列表] --> C[非节点要素边界检查]
    R[RuleSetConfigFields 列表] --> C
    N[ExtractNodesOutput] --> C
    C --> F[协议与字段过滤]
    F --> M[SSNodeProjection]
    M --> J[JSON 原生字段投影]
    M --> L[SCE 链接编译]
    J --> O[ConfigArtifact]
    L --> E[换行连接 / 显式外层编码]
    E --> O
```

SCE 依据：`src/generator/config/subexport.cpp::proxyToSingle / proxyToSSSub`；本仓库转换依据 `lib/subconverter/providers/ss/transform.ts`。两种输出模式均为本文约定，现有 provider 未提供完整文本 exporter。
