# Shadowrocket 输出

## schema

本目标生成逐行 URI 节点列表，整体交付 UTF-8 Base64 文本，媒体类型为 `text/plain`，遵守[链接订阅交付约定](../output-adapter.md#订阅生成节点)。不输出 YAML。

## 参数

链接字段及编码参考 [URI 参数](../sub-store/uri.md)和[完整字段表](../sub-store/parameters/uri.md)，字段保留遵守[输出适配约束](../output-adapter.md#订阅生成节点)。Sub-Store 的 [Shadowrocket YAML 参数](../sub-store/shadowrocket.md)仅作为外部格式参考，不是本目标 schema。

## 输入处理

只生成节点区域；输入规则和策略允许连线但忽略，不产生路由、策略组或远程资源。完整 Shadowrocket 客户端配置不属于本节点产物。
