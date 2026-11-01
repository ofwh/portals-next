# 目标输出服务

## 输入与产物

接收 OutputRequest：targetType、目标版本、NodeCollection、ResolvedGroupCollection、RulePlan、TemplateDefinition 以及明确的兼容和合并选项。核心输入是四类业务内容加输出目标；不接收需要重新执行整条链路的隐式配方。

输出 ConfigArtifact 包含 mediaType、配置文本、目标身份和诊断。失败时返回结构化错误，不能同时宣称配置成功可用。下载文件名或 HTTP 响应头属于交付层，可基于产物构造。

## 适配职责

每种目标适配器统一拥有该目标的协议字段投影、策略组行为映射、规则语法、模板区域装配和最终文档校验。输入解析器属于远程订阅服务，不能因为输出从 Clash 切到 sing-box 就更换订阅解析含义。

例如 Clash 适配器把代理和组映射到 proxies、proxy-groups，把规则条件与策略动作编译为 rules；sing-box 适配器把代理与选择组映射为相应 outbound，把规则映射为 route，并按所选版本处理终止动作和字段。两者共享业务数据，不能共享一份仅改键名的原生配置对象。

目标协议、组行为、条件类型与版本能力共同参与检查。无法无损表达时默认失败并指出对象和字段；允许跳过的兼容选项必须显式。跳过节点后必须重新检查组成员和规则引用，不得留下悬空引用。

## 身份与校验

统一将 nodeId、groupId 和内置动作映射为目标符号，处理与模板既有符号的冲突。规则通过 policyRef 查映射，不按显示名猜测关联。跨目标需要使用不同的内置动作文本。

最终校验包含引用存在、组循环、名称与资源身份冲突、目标字段结构及终止规则位置。序列化成功只证明可以生成文本，不证明客户端结构合法。

本设计核心输出内联节点，不自动生成 proxy-provider；规则也默认编译到目标支持的内联结构。以后若加入客户端远程资源，应增加明确产物类型和能力契约，不能只根据输入曾经来自 URL 就改变输出模式。

源码参考：`generator/config/subexport.cpp`、`generator/config/clash_proxy.cpp`、`generator/config/ruleconvert.cpp`。原项目部分逻辑跨文件混合，重写应按目标适配器边界归拢。
