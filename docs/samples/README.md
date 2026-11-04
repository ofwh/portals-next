# 输出配方示例

`rulesets.<type>.<ext>`、`policies.<type>.<ext>` 分别用于规则组解析、策略组解析节点，生成时选择文件名对应的输出类型。它们是输入配方，不是客户端最终配置；`.yml` 文件在解析节点中选择 `yaml`。

每个文件只包含该输出支持的最小配置、完整配置和有字段关联的特殊配置。完整配置填写该场景可用的可选字段，不表示所有选项可以同时启用。组合规则时，终止规则只保留末尾一条。

## 使用前提

- 规则中的 `Manual` 由同目标策略文件定义，两个解析结果需要一起连接到生成节点。
- 引用或筛选代理节点的策略需要上游提供 `HK-01`、`SG-01`。实际使用时替换名称或正则，保持成员非空、引用唯一且无循环；relay 成员按声明顺序组成链。
- 示例资源及检测 URL 使用 `example.com` 占位，执行前替换为可访问的 HTTP(S) 地址。资源正文必须符合示例声明的格式。

## 格式与选项

- INI 使用 `[custom]` 下的 `ruleset`、`custom_proxy_group`；字段名使用下划线。内联条件以 `[]` 开头，不重复附加策略或下载间隔。
- TOML 使用根级 `[[rulesets]]`、`[[custom_groups]]`。远程规则由 `type` 声明来源格式，`ruleset` 只填 URL；内联仍使用 `ruleset = "[]条件"`。
- YAML 使用 `custom.rulesets`、`custom.proxy_groups`。规则来源格式写在 URL 前缀，内联使用 `rule`。relay 使用字符串形式，保留有序成员语义。
- TOML 的 select 和无检测配置的 relay 显式填写 `timeout = 0`，用于阻止解析器补入默认超时；其他格式省略该字段。
- 规则下载间隔与策略检测间隔是不同参数。策略检测 URL 与正间隔配套；非零超时、容差只在对应目标支持的场景中展示。
- `stash-format` 仅在 Stash 示例中出现。其 `text` 场景声明纯文本正文，`mrs` 场景使用原生 domain/ipcidr provider，不能与需要展开正文的 `no-resolve` 组合。其他目标示例不使用该选项。
- `no-resolve` 仅在支持它的目标中展示，且对应规则为 IP 条件。

## 目标与来源

规则来源格式描述下载正文，输出类型描述生成结果，两者不必同名。Loon、Surfboard、sing-box 示例使用转换器能够读取并转换的 Surge 文本来源；这不代表能在它们的配置中使用 Surge 专属选项。

QuantumultX、Stash 示例仅保留当前能贯通生成的策略组合。支持范围以仓库解析与输出实现为准；协议能力及边界见[输出适配器](../subconverter/output-adapter.md)，字段读取方式见[规则解析](../subconverter/rules.md)与[策略解析](../subconverter/policies.md)。
