# Surfboard 输出类型

依据：[surfboard.js](https://github.com/sub-store-org/Sub-Store/blob/352f01b7091c99f4e219c44e4ec96f3288059843/backend/src/core/proxy-utils/producers/surfboard.js)。表格的类型和缺省语义遵守[阅读约定](README.md#阅读约定)。

## schema

String 节点行；不是完整 INI 文件。

```ini
Example=ss,proxy.example.com,443,encrypt-method=aes-128-gcm,password="secret"
```

## 参数

全部显式字段、嵌套路径、私有输入、删除规则、枚举及动态参数见[逐参数全表](parameters/surfboard.md)。以下表格解释主要字段的协议语义；共享字段通过公共表完整维护。

| 节点 / 范围                  | 字段                                                      | 类型                                   | 默认值 / 缺省行为       | 必须     | 选项 / 约束              | 示例                               | 映射说明       |
| ---------------------------- | --------------------------------------------------------- | -------------------------------------- | ----------------------- | -------- | ------------------------ | ---------------------------------- | -------------- |
| SS                           | `encrypt-method`                                          | `String`                               | 来源 cipher             | 是       | 未限定                   | `aes-128-gcm`                      | 按输入条件输出 |
| SS/Trojan/AnyTLS/HY2/TUIC-v5 | `password`                                                | `String`                               | 未声明                  | 认证所需 | 未限定                   | `"secret"`                         | 按输入条件输出 |
| SS                           | `obfs / obfs-host / obfs-uri`                             | `String`                               | 来源 simple-obfs        | 否       | 未限定                   | `http / cover.example.com / /`     | 按输入条件输出 |
| VMess                        | `username / vmess-aead / tls`                             | `String / Boolean 文本 / Boolean 文本` | 来源 UUID/AEAD/TLS      | 否       | 未限定                   | `UUID / true / true`               | 按输入条件输出 |
| WS                           | `ws / ws-path / ws-headers`                               | `Boolean 文本 / String / String`       | 未声明                  | 否       | 未限定                   | `true / /ws / Host:ws.example.com` | 按输入条件输出 |
| HTTP/SOCKS                   | `username / password`                                     | `String`                               | 未声明                  | 否       | 未限定                   | `user / secret`                    | 按输入条件输出 |
| TLS                          | `server-cert-fingerprint-sha256 / sni / skip-cert-verify` | `String / String / Boolean 文本`       | 存在时写                | 否       | 未限定                   | `SHA256 / tls.example.com / false` | 按输入条件输出 |
| Snell                        | `psk / version`                                           | `String / Number 文本`                 | 按来源与版本限制        | 否       | 未限定                   | `secret / 3`                       | 按输入条件输出 |
| TUIC                         | `原生类型`                                                | `String`                               | tuic-v5                 | 否       | 只输出 v5，token v4 抛错 | `tuic-v5`                          | 按输入条件输出 |
| TUIC-v5                      | `uuid`                                                    | `String`                               | 未声明                  | 是       | 未限定                   | `UUID`                             | 按输入条件输出 |
| HY2                          | `download-bandwidth / salamander-password`                | `Number 文本 / String`                 | 按 down/obfs-password   | 否       | 未限定                   | `100 / secret`                     | 按输入条件输出 |
| HY2/TUIC                     | `port-hopping / port-hopping-interval`                    | `String / Number 文本`                 | 来源 ports/hop-interval | 否       | 未限定                   | `"443;5000-6000" / 30`             | 按输入条件输出 |
| WireGuard Surge              | `section-name`                                            | `String`                               | 未声明                  | 否       | 未限定                   | `wg-section`                       | 按输入条件输出 |
| 支持的节点                   | `udp-relay`                                               | `Boolean 文本`                         | 存在时写                | 否       | 未限定                   | `false`                            | 按输入条件输出 |

公共位置字段和文本语义见[INI 公共字段](ini-common.md)。

## 能力与约束

默认包括 SS、Trojan、VMess、HTTP、SOCKS5、Snell、TUIC-v5、Hysteria2、wireguard-surge、AnyTLS。HTTPUpgrade 过滤；HY2 混淆仅 salamander；AnyTLS 的非 TCP/REALITY 组合过滤。不能复用 Surge 全部能力作为 Surfboard 能力。
