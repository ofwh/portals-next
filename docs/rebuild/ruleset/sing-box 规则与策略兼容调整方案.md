# sing-box 规则与策略兼容调整方案

本文为待实现方案。外部语法和目标映射以[核心配置简表](sing-box%20核心配置简表.md)为准，本文只定义模块边界、字段复用和兼容约束。节点组织遵循[工作流节点开发技能](../../../.codex/skills/workflow-node/SKILL.md)。

## 1. 调整范围与兼容原则

- 延续 `配置文本 → 规则/策略解析节点 → 编译节点 → 配置文本` 链路，不新增节点类型或专用连线。
- 保留 INI 的 `ruleset`、`custom_proxy_group`，以及节点配置的 `format`、`transformer`、`target`；新能力通过声明文本表达。
- 保留 `RuleSet[]`、`ProxyGroup[]` 和已有 `source` 联合结构，不拆出独立 remote 定义数组，不重复保存外部策略和内部出站。
- 旧声明和旧数据无需补字段即可读取；新字段缺省不改变旧语义。新增专用语法由 `singbox` transformer 接收，不改变其他 transformer 的默认类别及支持范围。
- 订阅代理节点仍由现有节点解析、转换链路提供；local/inline 原生规则集、逻辑规则及其他动作不在本次扩展范围。

## 2. 数据契约

### 2.1 规则字段复用

| 字段                                       | 兼容调整                                                                                                                                             |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                                       | 继续作为声明标识，不兼任输出 tag；避免改变原有标识语义                                                                                               |
| `group`                                    | 继续保存策略；仅原生 remote 允许空字符串，表示只定义、不生成路由引用                                                                                 |
| `category`                                 | 增加 `singbox`，表示原生 remote；通用来源保留原类别，通用内联在 singbox transformer 下沿用 Surge 通用语法类别                                        |
| `source.kind="resource"`、`source.address` | 复用为原生 remote 地址；解析后去掉来源前缀，不保存完整声明串                                                                                         |
| `source.kind="inline"`、`source.rule`      | 继续保存内联匹配、`RULE-SET` 和 `FINAL`                                                                                                              |
| `interval`                                 | 继续保存显式秒数；仅原生 remote 允许省略，省略或占位为空时不包含该字段，编译时不输出 update_interval；显式值须为正安全整数，其他类别维持既有周期约定 |
| `options.noResolve`、`options.stashFormat` | 保留原有含义，不挪作原生 remote 配置                                                                                                                 |
| `options.tag?`                             | 新增可选字符串，保存显式 remote tag；未提供时由编译器生成                                                                                            |
| `options.format?`                          | 新增可选 `source` / `binary`，仅保存显式格式；自动推断写法不填此字段                                                                                 |
| `options.downloadDetour?`                  | 新增可选字符串，保存下载出站；未提供时不输出下载出站字段                                                                                             |

三个新增 options 只允许用于 `category="singbox"` 的 resource。该类别不得携带通用规则选项，也不进入通用正文解析接口。通过类别与来源分支校验约束合法组合，不将 `group` 的空值规则全局放宽。

自动命名与 `id` 分离：按去掉查询参数、片段及扩展名的 URL 文件名生成候选 tag，无法得到非空名称时使用 `ruleset`；按声明顺序增加数字后缀，避让模板及显式 tag。编译前先预留所有显式 tag，避免自动名称占用后续显式定义。需要从其他声明引用的 remote 应显式填写 tag。

### 2.2 规则参数复用

- `RULE-SET` 继续使用 `Rule.parameters: string[]`，在 singbox 内联解析分支允许一个或多个非空 tag；不得把第二个 tag 当作 flag。其他 transformer 的单参数解析不变。
- `PRIVATE` 使用现有 `Rule` 结构，严格接收一个 `true` / `false` 参数，编译为布尔值 `ip_is_private`，不另增布尔匹配类型。
- `FINAL` 继续使用无参数 `Rule`，目标取外层 `group`；保留与 group 相同的冗余目标兼容写法。
- tag、节点名及组名保留大小写，不复用现有驱动对匹配值统一转小写的处理。

### 2.3 策略字段复用

| 字段                         | 兼容调整                                                                            |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| `ProxyGroup.name`、`kind`    | 保持不变；singbox 的输入 `selector` 归一化为已有 `kind="select"`                    |
| `selectors`                  | 继续表达显式引用与正则筛选，不新增 `tag://`、`include://` 选择器                    |
| `healthCheck`                | 继续承载 URL、周期、超时和容差；sing-box 不输出 timeout                             |
| `interruptExistConnections?` | 新增可选布尔字段，保留缺省与显式 false 的区别，编译为 `interrupt_exist_connections` |

`selector` 别名仅在 singbox 声明适配分支识别，不加入通用 `ProxyGroupKind`。只在该别名的分隔串末段识别 `true` / `false` 并移除；其余成员仍交给已有选择器解析。通用 `select` 中名称为 `true` / `false` 的旧正则不得被截取。开关缺省时不输出字段。

## 3. 规则模块

### 3.1 声明适配

来源前缀识别必须先于通用 resource 的尾部周期拆分。原生 remote 按固定位置读取 URL、interval、tag 和下载出站，保留中间空位，拒绝多余字段。不能继续用“最后一段是周期、其余重新拼回来源”的旧分支解析新增语法。

仅原生 remote 可以使用空策略；地址必须是有效 HTTP(S) URL。`singbox:` 根据 URL pathname 的 `.json` / `.srs` 判断是否可推断，但不保存或输出 `format`；不识别扩展名时返回声明错误。显式格式前缀不要求扩展名与格式一致，不请求远端验证正文。

通用来源与通用内联仍走已有声明读取逻辑，不改变旧周期、管道选项或逗号转义行为。新增分支继续使用现有分词工具，不采用简单的全串逗号拆分。

YAML/TOML 延续已有容器及 `group`、`ruleset`、`rule`、`interval`、`options` 字段形态。原生 remote 的 `ruleset` 同样使用来源前缀，新增 `tag`、`download_detour` 作为条目可选字段，映射到内部 options；格式继续由前缀表达，不新增第二个格式字段。来源类型和 TOML 显式 type 冲突时返回错误。

### 3.2 Transformer 与 resolver

新增规则 `singbox` transformer，支持：

- 无前缀资源默认按 Surge 类别读取；有通用来源前缀时显式分派现有 Surge、QuanX、Clash 类别 resolver。
- 三种原生 remote 前缀均交给同一个原生 remote resolver，输出 `category="singbox"`，差异归入 options。
- 内联复用通用规则解析器，在 singbox 专用入口处理多 tag `RULE-SET` 和 `PRIVATE`；不复制整套通用规则语法。

通用来源类别到旧 transformer 的映射保持不变；不能因为新增 transformer 接收多个类别，就把旧 `resolver="clash-domain"` 等草稿自动改成 singbox。原生 remote resolver 只转换声明，不提供 JSON/SRS 正文解析能力；声明 resolver 与正文 parser 的契约应显式区分，不能为满足接口提供无效占位实现。

### 3.3 Schema

规则运行时 schema 同步接收新增类别和 options，按来源分支校验空策略及选项适用范围。保留原字段白名单及旧对象兼容，不允许任意键透传。类型注册的基础结构须能覆盖新增字段；规则类型识别与“可解析正文类别”识别分离，避免把原生 remote 送入 `parseRuleContent`。

## 4. 策略模块

singbox transformer 仅接受 select/selector 和 url-test/urltest，分别归一化为 select 和 url-test。其他分组类型在策略解析阶段返回不支持错误，不降级、不按警告过滤；编译阶段同样拒绝绕过解析传入的不支持类型。selector 的末段开关和成员选择器保留既有语义。

sing-box 的 INI 测速尾部允许省略，保留尾部时继续使用 URL、周期/timeout/容差的位置；未设置的各项保留为空。YAML/TOML 直接读取显式字段，不套用其他目标的测速默认值。测速 URL、周期和容差仅在显式设置时输出，缺省交由 sing-box 处理；timeout 不输出为 sing-box 字段。对象写法的 `interrupt_exist_connections` 归入同一个内部字段，并执行布尔校验。

策略 schema 接收开关及可选的健康检查 URL，支持仅设置周期或容差。成员筛选为空时保留分组并输出空 outbounds，不自动补 DIRECT、不跳过、不在转换器额外报错；核心是否接受空组由 sing-box 决定。其他目标的解析器、类型支持和默认值不变。

## 5. 编译与资源交付

### 5.1 交付分类

`ruleDelivery` 对 singbox 目标的原生 resource 返回 `remote`；通用资源仍按原流程展开并转换。编译节点的资源加载只处理 `expand`，不下载原生 JSON/SRS，也不把 SRS 交给文本解码器。

其他配置文件目标收到原生 singbox remote 时，应在资源加载前返回明确的不支持错误，避免误下载后漏掉路由。URI 目标保持现有只输出代理节点的行为。新增专用内联指令不能在其他目标中原样输出为貌似有效的客户端规则；按目标能力返回不支持诊断。

### 5.2 Remote 定义与引用

编译分为定义收集和有序路由生成两部分：

1. 收集模板规则集及所有输入原生 remote，建立 tag 索引；支持先引用、后定义。
2. 将原生 remote 生成到 `route.rule_set`；group 为空时仅定义，非空时在原声明位置生成一条引用。
3. 将显式 `RULE-SET` 的全部参数作为一条路由的 `rule_set`，不逐 tag 拆分，也不与其他声明合并。
4. 引用可以指向输入定义或模板已有规则集；未定义 tag 返回编译错误。

同 tag、等价定义只输出一次，但不同声明的路由引用保留各自顺序。对比时覆盖来源类型、URL、有效格式、更新周期及下载配置；字段省略按协议缺省值比较。不同定义发生同 tag 冲突时返回错误，不静默覆盖模板。模板中的 local/inline 规则集可作为引用目标，但不新增其声明语法。

模板已有 remote 的 `download_detour`、`http_client` 保留原值。新声明显式下载出站必须输出为 `download_detour`，不能因模板存在 HTTP client 而删除或替换；省略下载出站不自动补 DIRECT 或 `http_client`。规则资源统一通过显式来源声明提供；不根据 GEOIP、GEOSITE 或 SRC-GEOIP 参数推导 tag、下载地址或自动补充规则集。GEOIP、GEOSITE 和 SRC-GEOIP 条件在 sing-box 编译时返回不支持诊断，包括 private 别名；私有地址使用显式 PRIVATE 指令。

### 5.3 出站动作与终结规则

- 普通策略生成 outbound 路由；`DIRECT` 引用已有直连 outbound；`REJECT` 生成 `action="reject"`，不生成 REJECT outbound。
- `PRIVATE` 在专用分支将参数转为布尔匹配，不能套用现有“布尔字段一律输出 true”的分桶逻辑。
- `FINAL` 写入 `route.final`，不加入普通规则数组，不允许 REJECT。singbox transformer 对新解析文本要求最多一条且位于声明末尾；编译器保留旧数据中多个终结目标最后生效的兼容行为。
- 没有输入终结规则时保留模板已有 final；模板也未提供时不输出空字符串。该行为替代现有无终结规则仍写空字符串的流程。
- 通用展开规则继续使用现有分桶转换；新增显式规则集引用按独立规则输出，保持声明之间的顺序和匹配语义。

直连统一使用 DIRECT。对来源模板中 `type="direct", tag="direct"` 的既有内置直连，可在替换 outbounds 时同步归一化其已知出站引用，包括组成员、路由 outbound、final 和下载出站；若同名实际代表用户节点或组，则报名称冲突，不全局替换字符串。仅凭名称为 `direct` 不推断其含义。

新增引用校验限定于本次生成的规则目标、组显式成员、下载出站及 final，以实际成功编码的节点、生成组和 DIRECT 为依据，并检查组循环引用。模板中保留的原规则不纳入新的全局引用修复。拒绝动作不能作为组成员或下载出站。

### 5.4 模板融合边界

继续沿用[编译驱动](../compile/drivers.md)的 outbounds 替换和普通规则覆盖选项；不自动生成 GLOBAL 分组或追加 Clash 模式规则。新增 remote 追加在模板规则集之后，按输入声明顺序排列；规则覆盖开关不删除模板规则集。前述 remote 下载字段、显式 tag 冲突及缺省 final 处理以本方案为调整边界，实现时同步修订编译驱动文档中的对应规则，避免保留两套相互冲突的约定。

### 5.5 uTLS 输出边界

仅在订阅节点显式提供指纹时输出已启用的 uTLS 及该指纹；不补默认 chrome，也不因 Reality 参数存在而启用 uTLS。缺省处理和依赖缺失错误交由 sing-box 负责。

## 6. 工作流子节点

| 子节点                          | 配置与端口                                                     | 必要调整                                                                                      |
| ------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 规则解析 `ruleset.resolve`      | 保留 `{ format, transformer }`、String 输入及 `RuleSet[]` 输出 | transformer 元数据增加 singbox；复用现有表单选项；同步配置校验、输出 schema、说明和中英文文案 |
| 策略解析 `policy.resolve`       | 保留现有配置、String 输入及 `ProxyGroup[]` 输出                | 继续使用已有 singbox 选项；输出 schema 接收新增开关，说明 selector 别名与旧 select 写法       |
| 订阅编译 `subscription.compile` | 保留 `{ target }` 和现有联合输入、String 输出                  | 更新共享 schema、资源交付分支及 singbox 驱动；多连线与数组合并顺序不变                        |
| 模板解析 `template.resolve`     | 保留现有配置和端口                                             | 继续提供 JSON 模板，不解析规则声明或下载资源                                                  |
| 代理解析、过滤、重命名节点      | 保留现有契约                                                   | 不承担规则或策略扩展；组筛选仍由编译阶段基于实际输出节点执行                                  |

新增 remote 参数属于声明文本，不在规则节点增加 tag、下载出站、更新周期等全局表单字段，避免覆盖多条声明的各自配置。运行错误继续由节点适配层转换为现有工作流业务错误；解析和编译诊断保留条目位置或索引。

## 7. 草稿、类型与版本兼容

- 节点默认配置不变；旧 `transformer` 值继续接受。旧 `resolver` 的可编辑草稿与可推断迁移规则保持原约定，不自动选择 singbox。
- 新增字段均为可选，旧 `RuleSet` 与 `ProxyGroup` 数据原样可读；不将空值默认写回草稿，不覆盖原始声明文本。
- `RuleSet`、`ProxyGroup` 的 ref 标识及版本可保持 1，前提是前后端共享 schema 同步更新且旧对象全部继续通过；此处表示新运行时接收旧数据，不保证旧运行时接收新数据。
- 节点持久化配置结构及端口未改变，不因新增解析选项单独提升节点版本。若实施时引入不兼容结构，必须提供迁移，不能仅提升版本跳过旧流程。
- 规则格式与映射只在核心简表定义；本方案承载兼容边界。实施时通用模块文档链接这些差异，不重复维护语法副本。
