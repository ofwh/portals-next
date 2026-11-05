# Shadowsocks(Mixed) 输出

## schema

不同协议的 URI 按原顺序逐行输出，最后整体 Base64 编码。该命名是本仓库目标；Sub-Store 的对应参考是 V2Ray 包装 producer，不是名为 Mixed 的独立 producer。

## 参数

内层节点遵守 [URI 参数表](../sub-store/uri.md)和[完整字段表](../sub-store/parameters/uri.md)，外层遵守 [V2Ray 包装](../sub-store/v2ray.md)。普通 SS 链接的 udp=0/1、UOT、TFO 等参数不会因为处于 Mixed 订阅而失效；不得将所有协议改写为 ss://。

## 输入处理

忽略输入规则和策略，不获取远程规则。协议准入由目标实现限制，不因参考 URI producer 支持更多类型而隐式扩大节点选项。
