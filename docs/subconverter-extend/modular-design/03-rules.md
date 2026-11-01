# 规则服务

## 职责与配置

定义规则集并关联策略组，形成可供目标输出的有序规则计划。规则集内容与流量动作分离：同一规则集可被多次绑定，绑定次序必须保留。

RuleSetDefinition 包含 ruleSetId、内容来源和源格式。内容来源可以是内联条件或远程资源；远程资源由本服务负责获取并解析，节点订阅服务不承担规则获取。源格式描述 domain、ipcidr、classical 等语义，不能从文件扩展名直接断定。

RuleBinding 包含 ruleSetId、policyRef、顺序及规则选项。policyRef 主要引用 groupId；DIRECT、REJECT 等作为显式内置动作支持。规则不能隐式创建一个同名组。

## 输出契约

RulePlan 包含归一化规则集、有序绑定、显式终止规则和诊断。条件以类型化表示保存域名、域名后缀、网段及其他匹配语义；no-resolve 等选项保留为有类型的数据。目标输出服务决定如何投影到客户端规则语法。

同源资源可以共享获取结果，但不同绑定不能按 URL 去重。源内顺序与绑定顺序分别保存。完整规则若已带策略动作，应走单独的完整规则输入类型，明确保留动作或重新绑定，不能再次附加策略列。

## 校验与合并

本模块校验规则集身份、来源格式、条件结构、绑定组存在和终止规则配置。格式错误、未知条件与不支持的选项均返回诊断。规则集存在但没有绑定，与获取失败是不同状态。

原 enable_rule_generator 映射为规则计划是否启用；overwrite_original_rules 映射为输出装配时的底稿规则保留策略。后者的领域含义由规则配置定义，具体目标文档修改交给目标输出服务。

ruleprepend/ruleappend 属于原项目扩展的完整 Clash 规则源。兼容时单独记录插入位置与目标约束；不将它们假装成所有客户端都可表达的通用规则条件。规则集刷新间隔在当前设计中控制服务端资源缓存或重新编译策略，不自动生成客户端 rule-provider。

源码参考：`config/ruleset.cpp`、`generator/config/ruleconvert.cpp`、`generator/config/external_rules.cpp`。与原 provider 方式的差异见[规则资源分析](../05-rules-groups.md)。
