# 分组解析器与解析方式

`format` 决定配置读取方式，`transformer` 选择与订阅类型关联的解析方式。两者均须显式指定。节点的解析方式选项直接取自 transformer 注册表，不维护独立列表。

## 职责

- 格式读取器抽取带来源位置的条目，字段路径见[分组配置](README.md)。声明适配层读取名称、类别和原始字段；INI 使用反引号分隔串，TOML 使用对象字段，YAML 沿用旧分隔串绑定的默认值及 relay、ssid 尾部语义。
- `lib/subscription/policy/resolvers` 按组类别组织单条声明的解析转换。resolver 只处理该条目的成员选择器、provider 引用、健康检查及适用选项，返回一个 `ProxyGroup`，不读取整份配置。
- `lib/subscription/policy/transformers` 按订阅类型组织解析方式。每个模块显式组合该类型支持的全部类别 resolver，读取条目声明后按类别分派。支持范围以 SubConverter-Extended 对应分组处理分支为基线；客户端版本、原生字段生成及有损降级由编译驱动处理。
- 解析方式不支持的类别被过滤，并返回带来源位置的警告，由节点记录日志。非法声明、字段或选项返回错误；节点遇到错误时失败。文档格式错误使整份解析失败。

分隔串与对象适配由格式决定，不作为节点可选择的解析方式。旧节点草稿中的语法选项不能推断订阅类型，保留为可编辑草稿，执行前必须显式选择 transformer。

## 类别解析

| 组类别       | 归一化处理                                                               |
| ------------ | ------------------------------------------------------------------------ |
| select       | 成员选择器；兼容旧语法末尾 HTTP(S) 健康检查 URL                          |
| url-test     | URL、周期、超时、容差；保留 lazy、evaluate-before-use                    |
| fallback     | URL、周期、超时；保留 evaluate-before-use                                |
| load-balance | URL、周期、超时、策略 consistent-hashing 或 round-robin；保留 persistent |
| relay        | 保留成员声明顺序                                                         |
| ssid         | 保留 SSID 所需的有序条目，目标驱动负责转成客户端语法                     |
| smart        | URL、周期、超时、容差及可选 lazy、evaluate-before-use                    |

公共字段为 name、kind、selectors、providerRefs、可选 healthCheck、disableUdp。成员选择器覆盖普通名称正则、`[]` 显式引用、`!!GROUP=`、`!!GROUPID=`、`!!INSERT=`、`!!TYPE=`、`!!PORT=`、`!!SERVER=`，以及尾部名称正则。若保留 `script:`，解析器生成脚本选择器描述，调用层注入获准的执行能力。求值语义以 [applyMatcher/groupGenerate](/Users/larify/Documents/github/SubConverter-Extended/src/generator/config/subexport.cpp:1354) 为基线。

[INI 绑定](/Users/larify/Documents/github/SubConverter-Extended/src/config/binding.h:202)与[TOML 绑定](/Users/larify/Documents/github/SubConverter-Extended/src/config/binding.h:38)定义条目字段。[旧 YAML 读取](/Users/larify/Documents/github/SubConverter-Extended/src/handler/settings.cpp:806)设置缺省探测 URL 和 300 秒周期，再走 INI 绑定。解析保留按语法区分的默认值，以及未设置和显式 false 的区别，不在此阶段执行成员筛选、资源获取或客户端语法生成。

sing-box 的类型支持、测速参数缺省及对象声明读取方式遵循[兼容调整方案](../ruleset/sing-box%20规则与策略兼容调整方案.md#4-策略模块)，不套用上述其他目标的兼容默认值。
