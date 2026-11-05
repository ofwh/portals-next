# Shadowrocket 输出类型

依据：[shadowrocket.js](https://github.com/sub-store-org/Sub-Store/blob/352f01b7091c99f4e219c44e4ec96f3288059843/backend/src/core/proxy-utils/producers/shadowrocket.js)。表格的类型和缺省语义遵守[阅读约定](README.md#阅读约定)。

## schema

YAML 代理列表，默认以 flow mapping 写每个节点；pretty-yaml 选项可改变排版，不改变结构。

```yaml
proxies:
  - { type: ss, name: Example, server: proxy.example.com, port: 443, cipher: aes-128-gcm, password: secret, udp: true }
```

## 参数

全部显式字段、嵌套路径、私有输入、删除规则、枚举及动态参数见[逐参数全表](parameters/shadowrocket.md)。以下表格解释主要字段的协议语义；共享字段通过公共表完整维护。

| 节点 / 范围     | 字段             | 类型     | 默认值 / 缺省行为     | 必须 | 选项 / 约束 | 示例                             | 映射说明                   |
| --------------- | ---------------- | -------- | --------------------- | ---- | ----------- | -------------------------------- | -------------------------- |
| TUIC            | `version`        | `Number` | 无 token 且未声明时 5 | 否   | 未限定      | `5`                              | 按输入条件输出             |
| WireGuard       | `ip / ipv6`      | `String` | 含 CIDR               | 否   | 未限定      | `10.0.0.2/32`                    | 按输入条件输出             |
| Snell+ShadowTLS | `obfs-opts`      | `Object` | 从 plugin-opts 改写   | 否   | 未限定      | `{mode: shadow-tls, version: 3}` | 与现有 obfs 配置冲突时过滤 |
| VMess/VLESS     | `servername`     | `String` | 由 sni 投影           | 否   | 未限定      | `tls.example.com`                | 按输入条件输出             |
| Snell version<3 | `udp`            | `不输出` | 删除                  | 否   | 未限定      | —                                | 按输入条件输出             |
| 外部输出        | `_ 开头的根字段` | `不输出` | 清理                  | 否   | 未限定      | —                                | 按输入条件输出             |

节点参数继承[公共字段](common.md)和[YAML 节点字段](yaml-fields.md)，仅在目标准入范围内适用。下表列出 producer 明确的字段差异，非闭合 schema。

## 能力与约束

此版本实际输出 YAML proxies 列表，不是 URI/Base64。按排除列表和组合条件过滤；Snell 允许 1–6；SS v2ray-plugin 准入 websocket/quic/http2/mkcp/grpc。不是全部 Shadowrocket 版本的兼容保证。
