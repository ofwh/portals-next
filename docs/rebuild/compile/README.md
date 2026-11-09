# 编译转换

根据目标订阅类型，将 `ProxyNode[]`、`ProxyGroup[]`、`RuleSet[]` 转换为目标数据，再按参考应用对应生成器的执行顺序与模板融合，序列化为最终订阅文本。节点字段转换、分组成员求值、规则转换和模板融合均需实现参考应用的等效行为。

`ProxyGroup[]` 为分组配置，`RuleSet[]` 为策略配置，其编译结果为目标的分流规则。URI 订阅目标仅输出节点订阅。目标范围与分目标行为见[目标驱动与模板融合](drivers.md)。

## 服务输入与职责

编译服务接收以下数据：

- `target`：必选的 `CompileTarget`。
- `nodes`、`groups`、`rulesets`：前三个模块输出的有序数据列表。
- `template`：配置文件目标所需的已解析模板；URI 订阅目标不使用模板。
- 规则资源正文：需要展开资源规则时，由调用层预先获取并按来源绑定正文；保留来源地址、规则语法、目标策略及更新周期，供驱动决定展开还是输出远程引用。编译核心不下载资源，也不因缺少正文而擅自改变输出方式。

输入列表不重新解析，模板不重新渲染。每次编译使用独立的节点与模板工作副本，名称处理及数据写入不得修改调用方输入。模板承载目标所需的对象、数组或有序 INI 节及条目；INI 的重复项、无键行和条目顺序不能在解析时丢失。Clash 模板应保留健康检查字段继承所需的标量、空值及 YAML 合并语义，必要时附带原始文本。

## 参数与分支

服务方法使用 `compile(input, options?)`，`input` 仅承载目标、节点、分组、策略、模板及规则资源数据。独立的 `CompileOptions` 参数为调用方预留覆盖能力，使用 `enableRuleGenerator`、`overwriteOriginalRules`，分别对应参考应用的 `enable_rule_generator`、`overwrite_original_rules`。这些选项不属于规则配置，不从上游声明、模板或规则解析结果读取、映射或透传；当前不增加页面或工作流配置项。

服务默认参数固定为 `enableRuleGenerator=true`、`overwriteOriginalRules=false`，调用方可分别显式覆盖；使用缺省值判断，不能把显式 `false` 当作未传入。

参考应用的默认值有不同来源：外部配置结构 `ExternalConfig` 使用上述 `true/false`，而全局 `Settings` 和生成器 `extra_settings` 的规则覆盖默认值为 `true`。本服务以本模块要求为准，显式传递两个参数，不依赖生成器或旧请求入口的默认值。

| enableRuleGenerator | overwriteOriginalRules | 配置文件目标行为                                                               |
| ------------------- | ---------------------- | ------------------------------------------------------------------------------ |
| false               | false 或 true          | 不执行策略转换及规则写入，保留模板规则和相关规则节；节点、分组仍正常转换和融合 |
| true                | false                  | 执行策略转换；按各目标的规则保留与追加行为融合                                 |
| true                | true                   | 执行策略转换；按各目标的规则覆盖行为融合，保留该目标要求保留的辅助数据         |

两个参数只控制规则生成阶段，不控制节点和分组的替换或追加。URI 订阅目标不执行规则阶段，两个参数不影响其输出。空 `RuleSet[]` 仍需执行启用的规则阶段，不能直接跳过：覆盖模式可能清空原规则，sing-box 还会处理 `route.final` 等字段。

未提及的请求或功能参数不实现配置入口及可选分支，包括列表模式、模板脚本、外部规则前后插入、托管转换地址、远程节点 provider、重命名脚本、排序与 emoji 等。节点自身的 TLS、传输层等字段仍按目标协议转换；目标普通配置分支的固有输出行为需要保留。Clash 固定使用参考请求入口强制采用的 `proxies`、`proxy-groups`、`rules` 新字段，以及本地展开节点方式；不启用远程节点 provider 模式。sing-box 使用参考默认的 Clash 模式辅助输出、WireGuard outbound 形式及 Snell 禁用分支，不扩展为可配置选项。

## 编译执行顺序

1. 根据 `target` 取得驱动，合并两项服务默认参数，准备独立工作副本。配置文件目标校验模板的格式及根结构；URI 目标直接进入节点输出流程。
2. 在覆盖模板节点和分组之前，提取该目标允许继承的模板数据，例如 Clash 健康检查字段、Loon 和 Quantumult X 的同名分组图标。
3. 按目标生成器遍历节点，执行目标能力过滤、字段转换、名称处理与协议限制判断，得到实际成功输出的节点及名称。保留参考代码的处理时机，包括名称处理与过滤的先后关系。
4. 按分组声明顺序处理目标支持的分组类型，使用实际输出的节点求值成员，转换类型、参数及空成员回退，再按目标方式写入模板工作副本。
5. `enableRuleGenerator=true` 时，按声明顺序处理策略，选择远程引用或正文展开分支，绑定声明中的策略目标，执行目标规则转换，再结合 `overwriteOriginalRules` 融合规则及辅助节。
6. 使用目标序列化器输出订阅文本、对应内容类型和脱敏诊断。字段顺序、规则顺序、重复项、空列表和空节处理遵循对应参考分支，不额外排序、去重或补全。

## 内部组织

实现位于 `lib/subscription/compile`。`transformers` 注册目标及其能力，`drivers` 按目标组织节点编码、分组求值与编码、策略转换、模板融合及序列化。服务入口只负责输入准备、两项参数默认值和目标分派。

目标驱动可按职责拆分节点、分组、规则与融合实现；仅在行为一致时提取协议族内的公共方法。转换阶段允许读取模板以提取继承字段，最终修改只发生在工作副本中。不以统一深合并、统一数组追加或统一引用校验替代目标差异。

目标不支持的条目按参考对应分支处理；模板解析、结构处理或序列化无法完成时，不返回部分订阅。诊断不包含凭据或资源正文。

## 实现依据

- [目标分派与请求默认值](/Users/larify/Documents/github/SubConverter-Extended/src/handler/interfaces.cpp)：目标映射、Surge 默认版本、Clash 新字段名及调用生成器的方式。
- [配置默认值](/Users/larify/Documents/github/SubConverter-Extended/src/handler/settings.h)与[生成器选项](/Users/larify/Documents/github/SubConverter-Extended/src/generator/config/subexport.h)：区分外部配置、全局设置和生成器默认值；服务仅实现本模块规定的两项可配置参数。
- [节点、分组与模板生成](/Users/larify/Documents/github/SubConverter-Extended/src/generator/config/subexport.cpp)：各目标 `proxyTo*`、`groupGenerate`、名称处理及序列化流程。
- [规则转换与融合](/Users/larify/Documents/github/SubConverter-Extended/src/generator/config/ruleconvert.cpp)：`rulesetToClash` / `rulesetToClashStr`、`rulesetToSurge`、`rulesetToSingBox` 及其辅助函数。
- [Clash 分组继承](/Users/larify/Documents/github/SubConverter-Extended/src/generator/config/clash_group_defaults.cpp)：模板健康检查字段解析、有效值判断与同名分组继承约束。
