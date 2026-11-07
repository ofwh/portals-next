# 规则解析器与解析方式

配置格式与订阅类型均必须显式指定。配置格式只决定读取方式：INI 使用分隔串，YAML/TOML 使用结构化字段。订阅类型选择 Surge、Quantumult X 或 Clash transformer；每个 transformer 显式组合该类型支持的全部类别 resolver，跨订阅类型的条目被过滤并返回带位置的警告，由调用层通过 logger 记录。

`transformers` 中的订阅类型模块处理单条原始配置，按格式读取声明，再分派类别 resolver。节点的选项来自 transformer 元数据，执行时只传入配置格式、transformer 和文本。元数据保持前端安全，不依赖正文解析器或 Node.js 模块。Clash 的资源引用必须由来源前缀或 TOML type 明确指定 domain、ipcidr 或 classic 类别，缺少时返回错误，不依据正文、文件扩展名或资源地址推断。内联标记优先于资源类别，来源前缀或 TOML type 不参与内联规则的类别分派；所有内联规则直接交给所选 transformer 的 inlineResolver。Clash 使用完整规则解析器并归入 clash-classic。资源引用的显式类别仍须与所选订阅类型一致。

`resolvers` 按 Surge、Quantumult X、Clash Domain、Clash IP CIDR 和 Clash Classical 类别组织，每个 resolver 的 `resolve` 将匹配的单条来源声明转换为一个 `RuleSet`。入口聚合为有序 `RuleSet[]`，保留条目明确的类别，允许同一 Clash transformer 输出包含不同类别的规则集。内联正文保留匹配参数和选项，目标组取外层声明；资源引用保留地址。Quantumult X 的资源正文处理类型别名并去除原策略，内联规则不经过该转换。资源正文解析接口使用同一模式注册表，并要求显式指定类别，不经过订阅类型 transformer，也不在声明解析阶段获取资源。

Clash Domain 与 Clash IP CIDR 共用 payload 值解析：同一序列允许混合域名、IPv4 CIDR 和 IPv6 CIDR，逐项识别并保持顺序。域名按域名语法归一化，CIDR 校验地址与前缀长度；非法值返回条目诊断。此共享能力不改变所选声明类别，Clash Classical 仍按完整规则行解析。

格式读取的声明字段缺失与容器校验遵循[公共解析与诊断](../shared/README.md)。正文严格按所选类别读取，不通过 `payload` 启发式改派其他解析器。完整规则行与内联规则共用通用语法。规则类型不使用目标输出能力白名单限制输入；已知规则按其参数结构拆分，扩展规则保留类型和参数，保留值不按客户端内置名称枚举。目标客户端支持的规则类型及 flags 由编译驱动校验。非法内联语法返回错误，不作为跨订阅类型警告过滤。

| 正文类别        | 识别方式                         | 现有转换与设计落点                                                                                                                     |
| --------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Surge           | `surge:` 或 TOML `surge-ruleset` | 旧转换原样通过，后续输出解析匹配条件。新正文 resolver 分离规则类型、参数和 flags                                                       |
| Quantumult X    | `quanx:` 或 TOML `quantumultx`   | HOST 系列转 DOMAIN 系列，IP6-CIDR 转 IP-CIDR6。按规则语法去掉原策略，保留支持的 flags                                                  |
| Clash Domain    | `clash-domain:`                  | 读取 payload，普通域名转 DOMAIN，点前缀及 `+.` 转 DOMAIN-SUFFIX，旧转换对带尾随 `.*` 的后缀形式转 DOMAIN-KEYWORD                       |
| Clash IP CIDR   | `clash-ipcidr:`                  | 读取 payload，按 IPv4/IPv6 区分 IP-CIDR 与 IP-CIDR6                                                                                    |
| Clash Classical | `clash-classic:`                 | 读取 payload，再按完整规则行语法处理类型、参数及 flags                                                                                 |
| 内联            | INI `[]` 或 YAML `rule`          | 去掉标记，按所选订阅类型解析一条完整规则；直接使用 inlineResolver，不受资源类别限制，目标取声明的 group；旧 TOML 绑定要求 ruleset 字段 |

旧 [convertRulesetUncached](/Users/larify/Documents/github/SubConverter-Extended/src/generator/config/ruleconvert.cpp:38)对非 Surge 类别按是否存在 payload 分流：有 payload 时进入 Clash 路径，Domain 与 CIDR 共用启发式转换；没有 payload 时进入 QuanX 路径。新入口要求显式选择相应类别：原文为 QuanX 时选择 QuanX；域名与 CIDR 的 payload 使用上述共享值解析能力。

使用能保持引号和逗号语义的分词，尤其是含逗号的规则参数。选项保留 `no-resolve`、`stash_format`（旧选项写法及可接受值按 [ruleset.cpp](/Users/larify/Documents/github/SubConverter-Extended/src/config/ruleset.cpp)），周期默认 86400 秒，按条目语法区分未设置和显式值。目标规则表示、默认规则、是否可输出原生 provider 由目标驱动决定。

若编译需展开资源，调用层用此模块的正文解析接口取得规则项，再按声明关联。

旧节点配置的 resolver 值若能确定订阅类型，则规范化为 transformer；仅表示分隔串或对象语法的值保留为可编辑草稿，执行前必须显式选择订阅类型。
