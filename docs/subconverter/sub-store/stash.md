# Stash 输出类型

依据：[stash.js](https://github.com/sub-store-org/Sub-Store/blob/352f01b7091c99f4e219c44e4ec96f3288059843/backend/src/core/proxy-utils/producers/stash.js)。表格的类型和缺省语义遵守[阅读约定](README.md#阅读约定)。

## schema

YAML 代理列表，默认以 flow mapping 写每个节点；pretty-yaml 选项可改变排版，不改变结构。

```yaml
proxies:
  - { type: ss, name: Example, server: proxy.example.com, port: 443, cipher: aes-128-gcm, password: secret, udp: true }
```

## 参数

全部显式字段、嵌套路径、私有输入、删除规则、枚举及动态参数见[逐参数全表](parameters/stash.md)。以下表格解释主要字段的协议语义；共享字段通过公共表完整维护。

| 节点 / 范围        | 字段                    | 类型                           | 默认值 / 缺省行为               | 必须     | 选项 / 约束 | 示例          | 映射说明              |
| ------------------ | ----------------------- | ------------------------------ | ------------------------------- | -------- | ----------- | ------------- | --------------------- |
| Hysteria2          | `auth`                  | `String`                       | 从 password 复制，移除 password | 是：认证 | 未限定      | `secret`      | 按输入条件输出        |
| Hysteria/Hysteria2 | `up-speed / down-speed` | `String / 缺失数字时 Number 0` | 提取来源数字部分                | 否       | 未限定      | `100`         | 不能宣称始终是 Number |
| Hysteria/TUIC      | `fast-open`             | `Boolean`                      | 有 tfo 且无 fast-open 时转写    | 否       | 未限定      | `true`        | 按输入条件输出        |
| TUIC               | `alpn`                  | `Array<String>`                | 缺省 [h3]                       | 否       | 未限定      | `["h3"]`      | 按输入条件输出        |
| TUIC               | `version`               | `Number`                       | 无 token 且未声明时 5           | 否       | 未限定      | `5`           | 按输入条件输出        |
| WireGuard          | `ip / ipv6`             | `String`                       | 加入 CIDR；缺省 /32 或 /128     | 否       | 未限定      | `10.0.0.2/32` | 按输入条件输出        |

节点参数继承[公共字段](common.md)和[YAML 节点字段](yaml-fields.md)，仅在目标准入范围内适用。下表列出 producer 明确的字段差异，非闭合 schema。

## 能力与约束

默认白名单还包括 Hysteria、Hysteria2、SSH、Juicity、AnyTLS、Tailscale、TrustTunnel、MASQUE、Mieru；Snell version>6 过滤。SS v2ray-plugin 仅 websocket；非 VLESS XHTTP、HTTPUpgrade 和受限 REALITY 组合过滤。
