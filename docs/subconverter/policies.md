# 策略解析

## 契约与边界

[策略 parser](../../lib/workflow/flows/configuration/policies-node/runtime/parser.ts) 具名导出 `parse(configuration: ConfigObject): PolicyConfigFields[]`。配置树由[配置解析器](configuration.md)提供；同一配置树可以分别交给策略与规则模块，不重复解析文本。

数据集读取、格式兼容适配和通用字段转换分开处理：

- 数据集读取负责路径、别名和字段形状，产出字符串或 `PolicyConfigNode`；不转换数字、展开成员或执行脚本。
- 格式兼容适配负责各配方的跳过条件、默认值及字段消费差异，不修改传入配置树。
- 内部 `transform(nodes)` 按字符串或对象处理，返回通用策略字段数组，不解析文件语法、不依赖原文件格式。

配置节点、通用字段及输出类型以[模型定义](../../lib/workflow/flows/configuration/policies-node/model/types.ts)和[字段定义](../../lib/subconverter/types/policies.ts)为准，不增加目标客户端专属属性。

节点类型选择、严格数字处理和通用字段错误遵循[解析公共约束](README.md#解析公共约束)。缺失整个策略区域返回空数组；显式 null、嵌套列表或单值字段出现多值，均属于字段错误。

## 配方路径

| 配方 | 位置                                                        | 读取方式               |
| ---- | ----------------------------------------------------------- | ---------------------- |
| INI  | `custom.custom_proxy_group*`                                | 按键前缀读取反引号定义 |
| YAML | `custom.proxy_groups`，缺失时取 `custom.custom_proxy_group` | 读取对象定义           |
| TOML | 根 `custom_groups`                                          | 读取数组表定义         |

别名按键是否存在选择，空的新字段不会回落旧字段。读取根数组表与 custom 区域时不改写配置树；集合顺序遵循 `ConfigObject` 的键顺序与同键值顺序，不恢复语法层未保留的跨键交错位置。

## 字符串与对象转换

INI 前两段为名称与类型。未知类型、段数不足以及测速组缺少必要段时跳过，与 SCE INI 绑定器一致。测速组从最后两段读取 URL 与 `interval,timeout,tolerance`，中间段才是成员；时间段中未提供的可选分量为 0，非空显式分量使用严格数字转换。

每个 `!!PROVIDER=` 成员按逗号拆资源名；`[]` 前缀去掉后成为 reference，其他内容保持为 selector。`!!GROUP/!!GROUPID/!!TYPE/!!PORT/!!SERVER/!!INSERT` 与 `script:` 均保留为 selector 文本。select 未指定非空 URL 且最后一个 selector 为 HTTP(S) URL 时，将它移入 URL 字段。

对象定义直接构造通用字段，不先拼接反引号行。对象字段中的 name/type/url 和时间字段只接受单个文本值，rule/use 只接受文本列表；是否消费字段以及缺省行为由对应配方适配决定。

## SCE 兼容行为

兼容依据为 SCE `src/handler/settings.cpp::readGroup`、`src/config/binding.h::INIBinding::from<ProxyGroupConfig>` 与 `toml::from<ProxyGroupConfig>`：

- YAML 缺失 name/type 按空文本读取，未知类型跳过；select 至少一个 rule，ssid 至少两个 rule，其他支持类型至少一个 rule，否则跳过。
- YAML 不转发 use。测速组未提供 URL/interval 时分别使用 `https://www.gstatic.com/generate_204` 和 300；缺失 timeout/tolerance 为 0。select/ssid 不消费对象中的测速参数，select 的末尾 URL 仍按公共转换规则提取。
- YAML relay 保留 `readGroup` 经 INI 绑定的行为：在原 rule 列表后追加健康检查 URL 与时间组合文本，二者作为 selector，不成为测速参数。
- TOML 必须提供 name/type，未知类型报错；测速类型必须提供 URL/interval，timeout 缺省为 5，其余未提供的测速分量为 0；use 转为 providers。
- TOML 必须保留至少一个 rule 或 provider；select 提取末尾健康检查 URL 后同样不能成为空组。

上述跳过和默认规则不包含节点或策略引用校验。显式数字仍遵循严格模式，不采用 SCE 的宽松整数截断。

## 后续处理边界

解析不展开节点、不执行正则或脚本、不判断目标支持情况、不检查名称唯一性、引用存在性或成员循环，也不创建稳定 groupId。

未展开的 `!!import:` 或对象 import 必须拒绝；加载器职责见[其余配置](other-options.md#加载与运行参数)。策略扩展字段及远程 provider 的消费边界见[策略扩展与远程代理资源](other-options.md#策略扩展与远程代理资源)。原始配置树保留额外字段，不代表通用输出已经支持它们。
