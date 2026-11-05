# Loon 输出类型

依据：[loon.js](https://github.com/sub-store-org/Sub-Store/blob/352f01b7091c99f4e219c44e4ec96f3288059843/backend/src/core/proxy-utils/producers/loon.js)。表格的类型和缺省语义遵守[阅读约定](README.md#阅读约定)。

## schema

String 节点行；不是完整 INI 文件。

```ini
Example=Shadowsocks,proxy.example.com,443,aes-128-gcm,"secret"
```

## 参数

全部显式字段、嵌套路径、私有输入、删除规则、枚举及动态参数见[逐参数全表](parameters/loon.md)。以下表格解释主要字段的协议语义；共享字段通过公共表完整维护。

| 节点 / 范围          | 字段                                                        | 类型                                      | 默认值 / 缺省行为                     | 必须           | 选项 / 约束               | 示例                                               | 映射说明                         |
| -------------------- | ----------------------------------------------------------- | ----------------------------------------- | ------------------------------------- | -------------- | ------------------------- | -------------------------------------------------- | -------------------------------- |
| SS/SSR/VMess         | `加密方法、密码或 UUID`                                     | `位置 String`                             | 依协议填入第 4/5 段                   | 是             | 未限定                    | `aes-128-gcm,"secret"`                             | 按输入条件输出                   |
| SS                   | `混淆方式、混淆主机`                                        | `位置 String / 命名参数，按分支`          | 来源 plugin-opts                      | 否             | 未限定                    | `http,cover.example.com`                           | 按输入条件输出                   |
| SS ShadowTLS         | `shadow-tls-password / shadow-tls-sni / shadow-tls-version` | `String / String / Number 文本`           | 按插件版本处理                        | 否             | 未限定                    | `secret / cover.example.com / 3`                   | 按输入条件输出                   |
| SSR                  | `protocol / protocol-param / obfs / obfs-param`             | `String`                                  | 未声明                                | 协议与混淆必需 | 未限定                    | `auth_aes128_sha1 / param / plain / param`         | 按输入条件输出                   |
| VMess                | `alterId`                                                   | `Number 文本`                             | 来源 alterId                          | 否             | 未限定                    | `0`                                                | 按输入条件输出                   |
| VMess/VLESS/Trojan   | `transport / path / host`                                   | `String`                                  | 按 network 投影                       | 否             | tcp/ws/http，协议各自约束 | `ws / /ws / ws.example.com`                        | 按输入条件输出                   |
| VMess/VLESS          | `over-tls`                                                  | `Boolean 文本`                            | 来源 tls                              | 否             | 未限定                    | `true`                                             | 按输入条件输出                   |
| VLESS                | `UUID`                                                      | `位置 String`                             | 未声明                                | 是             | 未限定                    | `"UUID"`                                           | 按输入条件输出                   |
| VLESS REALITY        | `flow / public-key / short-id`                              | `String`                                  | 未声明                                | 否             | 未限定                    | `xtls-rprx-vision / key / 0123456789abcdef`        | 按输入条件输出                   |
| Trojan/AnyTLS/HY2    | `password`                                                  | `位置 String`                             | 未声明                                | 是             | 未限定                    | `"secret"`                                         | 按输入条件输出                   |
| TLS                  | `sni / skip-cert-verify / tls-profile / alpn`               | `String / Boolean 文本 / String / String` | 按来源条件                            | 否             | 未限定                    | `tls.example.com / false / chrome / "h2,http/1.1"` | 按输入条件输出                   |
| HTTP/SOCKS           | `username / password`                                       | `位置 String`                             | 未声明                                | 否             | 未限定                    | `user,"secret"`                                    | 按输入条件输出                   |
| AnyTLS/HTTP/SOCKS 等 | `block-quic`                                                | `Boolean 文本`                            | 按源 block-quic 归一                  | 否             | 未限定                    | `false`                                            | 按输入条件输出                   |
| 支持的节点           | `udp`                                                       | `Boolean 文本`                            | 部分分支仅 udp=true 时写 true         | 否             | 未限定                    | `true`                                             | 不能用 Surge 的 udp-relay 键代替 |
| WireGuard            | `private-key / public-key / preshared-key`                  | `String`                                  | 由配置投影                            | 密钥所需       | 未限定                    | `Base64 密钥`                                      | 按输入条件输出                   |
| WireGuard            | `interface-ip / interface-ipv6 / peers`                     | `String`                                  | 由地址和 peers 投影                   | 否             | 未限定                    | `10.0.0.2 / peer 配置`                             | 按输入条件输出                   |
| HY2                  | `server-ports / hop-interval / salamander-password`         | `String / Number 文本 / String`           | 来源 ports/hop-interval/obfs-password | 否             | 未限定                    | `"443,5000-6000" / 30 / secret`                    | 按输入条件输出                   |
| 公共                 | `server-dns`                                                | `String`                                  | 来源为非空数组时逗号拼接              | 否             | 未限定                    | `"1.1.1.1,8.8.8.8"`                                | 按输入条件输出                   |

公共位置字段和文本语义见[INI 公共字段](ini-common.md)。

## 能力与约束

正常分支包括 SS、SSR、Trojan、VMess、VLESS、HTTP、SOCKS5、WireGuard、Hysteria2、AnyTLS。无 Snell/TUIC 分支。HTTPUpgrade 过滤；VMess/VLESS 的传输和客户端 TLS 指纹受各自限制。
