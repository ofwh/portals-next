# Clash.Meta / Mihomo 输出类型

依据：[clashmeta.js](https://github.com/sub-store-org/Sub-Store/blob/352f01b7091c99f4e219c44e4ec96f3288059843/backend/src/core/proxy-utils/producers/clashmeta.js)。表格的类型和缺省语义遵守[阅读约定](README.md#阅读约定)。

## schema

YAML 代理列表，默认以 flow mapping 写每个节点；pretty-yaml 选项可改变排版，不改变结构。

```yaml
proxies:
  - { type: ss, name: Example, server: proxy.example.com, port: 443, cipher: aes-128-gcm, password: secret, udp: true }
```

## 参数

全部显式字段、嵌套路径、私有输入、删除规则、枚举及动态参数见[逐参数全表](parameters/clashmeta.md)。以下表格解释主要字段的协议语义；共享字段通过公共表完整维护。

| 节点 / 范围 | 字段                 | 类型                     | 默认值 / 缺省行为 | 必须 | 选项 / 约束                           | 示例                             | 映射说明                           |
| ----------- | -------------------- | ------------------------ | ----------------- | ---- | ------------------------------------- | -------------------------------- | ---------------------------------- |
| REALITY     | `client-fingerprint` | `String`                 | 缺省 chrome       | 否   | 未限定                                | `chrome`                         | 按输入条件输出                     |
| SS          | `plugin-opts.mux`    | `Boolean`                | 有值时按规则归一  | 否   | 未限定                                | `false`                          | 按输入条件输出                     |
| Snell       | `version`            | `Number / 可解析 String` | 未声明            | 否   | 1 / 2 / 3 / 4 / 5；缺省不在此层补版本 | `5`                              | 按输入条件输出                     |
| VMess/VLESS | `servername`         | `String`                 | 由 sni 投影       | 否   | 未限定                                | `tls.example.com`                | 按输入条件输出                     |
| ShadowTLS   | `shadow-tls-opts`    | `Object`                 | 从 plugin 恢复    | 否   | 未限定                                | `{version: 3, password: secret}` | SS/Snell 与流协议版本约束不同      |
| 外部输出    | `_ 开头的根字段`     | `不输出`                 | 清理              | 否   | 未限定                                | —                                | 并非所有嵌套私有字段都采用相同规则 |

节点参数继承[公共字段](common.md)和[YAML 节点字段](yaml-fields.md)，仅在目标准入范围内适用。下表列出 producer 明确的字段差异，非闭合 schema。

## 能力与约束

该 producer 基于开放对象过滤和清理，不维护统一 type 白名单。默认过滤 juicity/naive，限制 SS cipher、v2ray-plugin mode 与 Snell version；不应将其当作客户端能力的完整清单。没有独立 clashr producer。
