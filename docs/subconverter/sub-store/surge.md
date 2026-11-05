# Surge 输出类型

依据：[surge.js](https://github.com/sub-store-org/Sub-Store/blob/352f01b7091c99f4e219c44e4ec96f3288059843/backend/src/core/proxy-utils/producers/surge.js)。表格的类型和缺省语义遵守[阅读约定](README.md#阅读约定)。

## schema

String 节点行；不是完整 INI 文件。

```ini
Example=ss,proxy.example.com,443,encrypt-method=aes-128-gcm,password="secret",udp-relay=false
```

## 参数

全部显式字段、嵌套路径、私有输入、删除规则、枚举及动态参数见[逐参数全表](parameters/surge.md)。以下表格解释主要字段的协议语义；共享字段通过公共表完整维护。

| 节点 / 范围                  | 字段                                                        | 类型                                  | 默认值 / 缺省行为       | 必须       | 选项 / 约束              | 示例                               | 映射说明                                                           |
| ---------------------------- | ----------------------------------------------------------- | ------------------------------------- | ----------------------- | ---------- | ------------------------ | ---------------------------------- | ------------------------------------------------------------------ |
| SS                           | `encrypt-method`                                            | `String`                              | 缺省 none               | 是         | producer cipher 白名单   | `aes-128-gcm`                      | 按输入条件输出                                                     |
| SS/Trojan/HY2/AnyTLS/TUIC-v5 | `password`                                                  | `String`                              | 有来源才写              | 按认证条件 | 未限定                   | `"secret"`                         | 按输入条件输出                                                     |
| SS                           | `obfs / obfs-host / obfs-uri`                               | `String`                              | 来源 obfs 插件          | 否         | 未限定                   | `http / cover.example.com / /`     | 按输入条件输出                                                     |
| SS/Snell 等                  | `shadow-tls-password / shadow-tls-sni / shadow-tls-version` | `String / String / Number 文本`       | 来源 ShadowTLS 配置     | 否         | 未限定                   | `secret / cover.example.com / 3`   | 具体键为 shadow-tls-password / shadow-tls-sni / shadow-tls-version |
| VMess                        | `username`                                                  | `String`                              | 来源 uuid               | 是         | 未限定                   | `UUID`                             | 按输入条件输出                                                     |
| VMess                        | `vmess-aead`                                                | `Boolean 文本`                        | 由 aead 或 alterId 决定 | 否         | 未限定                   | `true`                             | 按输入条件输出                                                     |
| VMess                        | `tls`                                                       | `Boolean 文本`                        | 来源 tls                | 否         | 未限定                   | `true`                             | 按输入条件输出                                                     |
| WS                           | `ws / ws-path / ws-headers`                                 | `Boolean 文本 / String / String`      | 存在 WS 时输出          | 否         | 未限定                   | `true / /ws / Host:ws.example.com` | 按输入条件输出                                                     |
| Trojan/HTTP/SOCKS 等         | `server-cert-fingerprint-sha256`                            | `String`                              | 来源 tls-fingerprint    | 否         | 未限定                   | `证书 SHA256`                      | 按输入条件输出                                                     |
| HTTP/SOCKS/SSH               | `username`                                                  | `String`                              | 未声明                  | 否         | 未限定                   | `user`                             | 按输入条件输出                                                     |
| HTTP/SOCKS                   | `password`                                                  | `String`                              | 未声明                  | 否         | 未限定                   | `"secret"`                         | 按输入条件输出                                                     |
| HTTP                         | `tls`                                                       | `Boolean 文本`                        | 来源 tls                | 否         | 未限定                   | `true`                             | 按输入条件输出                                                     |
| HTTP/2 CONNECT               | `原生类型`                                                  | `String`                              | h2-connect              | 否         | 未限定                   | `h2-connect`                       | 按输入条件输出                                                     |
| HTTP/2 CONNECT               | `udp-relay`                                                 | `Boolean 文本`                        | 有来源时写              | 否         | 未限定                   | `true`                             | 按输入条件输出                                                     |
| Snell                        | `psk`                                                       | `String`                              | 未声明                  | 是         | 未限定                   | `"secret"`                         | 按输入条件输出                                                     |
| Snell                        | `version`                                                   | `Number 文本`                         | 缺省 1                  | 否         | 1–6；按版本验证混淆/QUIC | `6`                                | 按输入条件输出                                                     |
| Snell                        | `reuse / udp-port / mode`                                   | `Boolean 文本 / Number 文本 / String` | 未声明                  | 否         | 未限定                   | `true / 8443 / unshaped`           | 按输入条件输出                                                     |
| TUIC v4                      | `原生类型 / token`                                          | `String / String`                     | 存在 token 时 tuic      | 条件：v4   | 未限定                   | `tuic / token`                     | 按输入条件输出                                                     |
| TUIC v5                      | `原生类型 / uuid`                                           | `String / String`                     | 无 token 时 tuic-v5     | 条件：v5   | 未限定                   | `tuic-v5 / UUID`                   | 按输入条件输出                                                     |
| HY2/TUIC                     | `port-hopping`                                              | `String`                              | ports 中逗号改为分号    | 否         | 未限定                   | `"443;5000-6000"`                  | 按输入条件输出                                                     |
| HY2/TUIC                     | `port-hopping-interval`                                     | `Number 文本`                         | 来源 hop-interval       | 否         | 未限定                   | `30`                               | 按输入条件输出                                                     |
| HY2                          | `download-bandwidth`                                        | `Number 文本`                         | 来源 down 数字部分      | 否         | 未限定                   | `100`                              | 按输入条件输出                                                     |
| HY2                          | `salamander-password / gecko-password`                      | `String`                              | 按 obfs 类型生成        | 否         | 未限定                   | `"secret"`                         | 按输入条件输出                                                     |
| AnyTLS                       | `alpn`                                                      | `String`                              | 由数组/字符串格式化     | 否         | 未限定                   | `"h2,http/1.1"`                    | 按输入条件输出                                                     |
| WireGuard Surge              | `section-name`                                              | `String`                              | 来源 section-name       | 否         | 未限定                   | `wg-section`                       | 引用单独 WireGuard section，非通用 peer 内联                       |
| SSH                          | `private-key / private-key-passphrase`                      | `String`                              | 存在密钥时编码          | 否         | 未限定                   | `密钥`                             | 按输入条件输出                                                     |
| SSH                          | `server-fingerprint`                                        | `String`                              | 未声明                  | 否         | 未限定                   | `ssh-ed25519 …`                    | 按输入条件输出                                                     |
| TrustTunnel                  | `username / password`                                       | `String`                              | 未声明                  | 认证所需   | 未限定                   | `user / secret`                    | 按输入条件输出                                                     |
| MASQUE Surge                 | `url / private-key / public-key`                            | `String`                              | 来源原生字段            | 否         | 未限定                   | `https://masque.example.com`       | 按输入条件输出                                                     |
| Direct                       | `原生类型`                                                  | `String`                              | direct                  | 否         | 未限定                   | `direct`                           | 按输入条件输出                                                     |
| 公共                         | `tfo / underlying-proxy / interface`                        | `Boolean 文本 / String / String`      | 存在时写                | 否         | 未限定                   | `false / 前置 / en0`               | 按输入条件输出                                                     |
| 公共                         | `test-url / test-timeout / test-udp`                        | `String / Number 文本 / Boolean 文本` | 存在时写                | 否         | 未限定                   | `https://example.com / 5 / true`   | 按输入条件输出                                                     |

公共位置字段和文本语义见[INI 公共字段](ini-common.md)。

## 能力与约束

默认支持 ss/trojan/vmess/http/h2-connect/direct/socks5/snell/tuic/wireguard-surge/hysteria2/ssh/trusttunnel/masque-surge/anytls 分支。普通 wireguard 需 include-unsupported-proxy；必须保留独立 section 才能完成配置。SS 不支持 v2ray-plugin 的正常路径；AnyTLS 对传输与 REALITY 有限制。
