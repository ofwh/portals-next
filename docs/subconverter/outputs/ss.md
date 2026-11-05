# Shadowsocks(SS) 输出

## schema

本目标生成 SS URI 列表，并按[链接订阅交付约定](../output-adapter.md#订阅生成节点)整体 Base64 编码。不是 SS JSON provider 的原生配置数组。

## 参数

逐节点凭据、插件、UDP、UOT、TFO、TLS 与传输参数参考 [Sub-Store URI 参数表](../sub-store/uri.md)及其[完整字段表](../sub-store/parameters/uri.md)；字段是否输出遵守[输出适配约束](../output-adapter.md#订阅生成节点)，不沿用参考实现的默认补值。目标仅选取其允许的节点协议；SSR 转为 SS 须满足加密方法、协议和混淆兼容约束。

`udp`、`uot`、`tfo` 的输入分别为 `udp`、`udpOverTcpEnabled`、`tcpFastOpen`：字段未提供则省略；显式 true 输出 `1`，显式 false 输出 `0`。

## 输入处理

规则和策略允许连线，生成时忽略，不下载规则、不展开策略成员。节点格式以转换后的结构化字段为准，不使用旧 raw 链接覆盖字段更新。
