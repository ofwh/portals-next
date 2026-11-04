# 规则解析

## 契约与边界

[规则 parser](../../lib/workflow/flows/configuration/rulesets-node/runtime/parser.ts) 具名导出 `parse(configuration: ConfigObject): RuleSetConfigFields[]`。配置树由[配置解析器](configuration.md)提供；同一配置树可以分别交给规则与策略模块。

数据集读取负责路径、别名和字段形状，产出字符串或 `RuleSetConfigNode`；格式兼容适配负责来源选择和格式默认值；内部 `transform(nodes)` 将字符串或对象直接转换为通用规则定义，不重新解析文件语法、不修改输入。

配置节点和通用输出以[模型定义](../../lib/workflow/flows/configuration/rulesets-node/model/types.ts)和[字段定义](../../lib/subconverter/types/rulesets.ts)为准。inline 输出单条规则条件，不附加目标策略；remote 输出资源引用及其来源格式，不增加规则正文 AST、下载状态、策略 ID 或目标客户端字段。

节点类型选择、严格数字处理和字段错误遵循[解析公共约束](README.md#解析公共约束)。缺失整个规则区域返回空数组；显式 null、错误对象形状和单值字段出现多值属于字段错误。集合顺序遵循 `ConfigObject`，重复绑定不去重。

## 配方路径与来源

| 配方 | 位置                                                    | 读取方式       |
| ---- | ------------------------------------------------------- | -------------- |
| INI  | `custom.ruleset*`，无此前缀时取 `custom.surge_ruleset*` | 读取规则行     |
| YAML | `custom.rulesets`，缺失时取 `custom.surge_ruleset`      | 读取对象定义   |
| TOML | 根 `rulesets`                                           | 读取数组表定义 |

别名按键是否存在判断，空的新字段不会回落。对象的 group/rule/ruleset/type/interval 在消费时须为单个文本值，options 须为文本列表。数字转换仅发生在内容转换阶段。

YAML 按 SCE `readRuleset` 处理：缺失 group 使用空文本；优先非空 ruleset，否则使用非空 rule，二者均为空时跳过；不消费对象 type，来源格式从 ruleset 前缀确定。

TOML 必须提供 group/ruleset，type 缺省为 surge-ruleset；surge-ruleset 与 quantumultx 分别映射 surge 与 quanx，其余支持类型沿用通用来源名称。未知 type 报错。TOML 的 type 决定 format，ruleset 原文作为 URL 保留，不再次剥离其中已有的格式前缀，与 SCE 先添加类型前缀的行为一致。

## 规则行与选项

1. 第一个逗号分开 policy 与来源。无逗号时跳过；来源以 `[]` 开头时余下整段作为 inline rule，包括其中的逗号。
2. 远程来源无 interval 段时使用现有默认值；存在时按最后一个逗号分开来源和 `interval|option...`。对象直接读取对应字段，不通过拼接字符串转换。
3. 已知来源前缀决定 format，并从 URL 移除。未知前缀保持为 URL 内容并按 Surge 处理，不将 HTTP(S) 协议当作规则格式。
4. 选项去除首尾空白并转小写；no-resolve 映射 noResolve，stash-format 映射 resourceFormat。空选项和未知选项忽略，不接受把 `,no-resolve` 当成选项扩展。
5. 相互冲突的有效 stash-format 不进入通用输出：SCE 将其标记为 invalid，本模块因通用字段不支持该状态而报字段错误。未知 stash-format 值按未知选项忽略。
6. 不额外拒绝空策略、空字符串来源或空内联条件；引用和最终可用性由后续消费方处理。已知数字位置仍严格转换，不能因 SCE 的宽松数字处理而截断非法文本。

容错依据为 SCE `src/config/ruleset.cpp::parseRulesetConfigLine/parseRulesetOptions`、`src/handler/settings.cpp::readRuleset` 与 `src/config/binding.h::from<RulesetConfig>`。未知选项的忽略不改变输出类型，也不在规则定义数组中附加诊断字段。

## 加载与输出边界

未展开的 `!!import:` 或对象 import 必须拒绝，不伪造为 URL。片段加载、作用域限制和展开属于[独立加载器](other-options.md#加载与运行参数)。

本阶段不下载规则资源、不绑定策略、不解析规则正文 AST、不执行目标格式投影。规则资源获取、附加策略及最终输出由[输出适配器](output-adapter.md)负责。
