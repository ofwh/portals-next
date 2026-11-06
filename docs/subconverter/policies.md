# 策略解析

## 契约与边界

[策略 parser](../../lib/subconverter/policies/index.ts) 接收配置树及客户端类型，返回通用策略定义。配置树由[配置解析器](configuration.md)提供；解析分层及客户端选择见[客户端解析选择](README.md#客户端解析选择)。

数据集读取负责路径、别名和字段形状，客户端解析器处理默认值与字段支持范围，公共转换器处理成员及数字转换。不修改输入配置树。

## 配方路径与字段

根级 `custom_groups` 优先读取对象列表；否则读取 `custom.proxy_groups`，缺失时选择 `custom.custom_proxy_group*`。别名按键是否存在判断，空的新字段不回落。缺失对应配置区域报错；显式空列表允许返回空数组。

对象必须提供 name/type；rule/use 为文本列表，use 保留为供应者声明。检测字段的默认值与支持范围按客户端处理，不因 INI、YAML、TOML 改变。字段形状以[业务类型](../../lib/subconverter/types/policies.ts)为准。

字符串使用反引号分隔名称、行为类型及成员。测速组从最后两段读取 URL 与 `interval,timeout,tolerance`，中间段为成员；非空数字分量必须是非负安全整数，缺失可选分量转换为 0。

## 成员与错误

`!!PROVIDER=` 成员按逗号拆分供应者名称；`[]` 前缀表示命名引用，其余文本保留为 selector。select 未提供非空 URL 且最后一个 selector 为 HTTP(S) URL 时，将该项提取为 URL。

缺少必要字段、非法字段形状、非法数字、不支持的策略行为或客户端字段均报字段错误。未展开的 `!!import:` 或对象 import 必须拒绝。

解析不展开节点或供应者、不执行正则或脚本、不检查引用、名称唯一性及成员循环。这些校验与最终字段投影由[输出适配器](output-adapter.md)负责；扩展能力边界见[其余配置](other-options.md)。
