# Quantumult X 输出类型

依据：[qx.js](https://github.com/sub-store-org/Sub-Store/blob/352f01b7091c99f4e219c44e4ec96f3288059843/backend/src/core/proxy-utils/producers/qx.js)。表格的类型和缺省语义遵守[阅读约定](README.md#阅读约定)。

## schema

String 节点行；不是完整 INI 文件。

```ini
shadowsocks=proxy.example.com:443,method=aes-128-gcm,password=secret,udp-relay=false,tag=Example
```

## 参数

全部显式字段、嵌套路径、私有输入、删除规则、枚举及动态参数见[逐参数全表](parameters/qx.md)。以下表格解释主要字段的协议语义；共享字段通过公共表完整维护。

| 节点 / 范围        | 字段                                           | 类型                        | 默认值 / 缺省行为                             | 必须           | 选项 / 约束                                       | 示例                       | 映射说明       |
| ------------------ | ---------------------------------------------- | --------------------------- | --------------------------------------------- | -------------- | ------------------------------------------------- | -------------------------- | -------------- |
| 所有行             | `左侧协议类型`                                 | `String`                    | 未声明                                        | 是             | shadowsocks/vmess/vless/trojan/http/socks5/anytls | `shadowsocks`              | 按输入条件输出 |
| 所有行             | `server:port`                                  | `String`                    | 未声明                                        | 是             | 未限定                                            | `[2001:db8::1]:443`        | 按输入条件输出 |
| 所有行             | `tag`                                          | `String`                    | 来源 name                                     | 是             | 未限定                                            | `Example`                  | 按输入条件输出 |
| SS/SSR/VMess/VLESS | `method`                                       | `String`                    | SS 缺省 none；VLESS 固定 none；VMess 归一化   | 条件：对应协议 | 未限定                                            | `aes-128-gcm`              | 按输入条件输出 |
| 认证               | `password`                                     | `String`                    | VMess/VLESS 用 UUID；其他为密码               | 按协议所需     | 未限定                                            | `UUID`                     | 按输入条件输出 |
| SS Simple Obfs     | `obfs`                                         | `String`                    | 保留 QX HTTP-obfs 别名或来源 mode             | 否             | http/tls/vmess-http/vemss-http/shadowsocks-http   | `http`                     | 按输入条件输出 |
| SS v2ray-plugin    | `obfs`                                         | `String`                    | websocket→ws/wss，按 tls                      | 否             | ws/wss                                            | `wss`                      | 按输入条件输出 |
| 传输               | `obfs-host / obfs-uri`                         | `String`                    | 插件或传输 host/path                          | 否             | 未限定                                            | `ws.example.com / /ws`     | 按输入条件输出 |
| SSR                | `ssr-protocol / ssr-protocol-param`            | `String`                    | 来源 protocol/protocol-param                  | protocol 必需  | 未限定                                            | `auth_chain_a / param`     | 按输入条件输出 |
| VMess              | `aead`                                         | `Boolean 文本`              | 按 alterId/AEAD 来源                          | 否             | 未限定                                            | `true`                     | 按输入条件输出 |
| TLS                | `over-tls / tls-host`                          | `Boolean 文本 / String`     | 按协议和传输选择                              | 否             | 未限定                                            | `true / tls.example.com`   | 按输入条件输出 |
| TLS                | `tls-verification`                             | `Boolean 文本 / 来源兼容值` | name-cert-verify 优先，否则 !skip-cert-verify | 否             | 未限定                                            | `true`                     | 按输入条件输出 |
| TLS                | `tls-alpn`                                     | `String`                    | 显式 tls-alpn 优先；否则 ALPN 编码            | 否             | 长度字节+UTF-8 字节的十六进制串                   | `02683208687474702f312e31` | 按输入条件输出 |
| TLS                | `tls-cert-sha256 / tls-pubkey-sha256`          | `String`                    | 按来源                                        | 否             | 未限定                                            | `SHA256`                   | 按输入条件输出 |
| TLS                | `tls-no-session-ticket / tls-no-session-reuse` | `Boolean 文本`              | 有值写                                        | 否             | 未限定                                            | `true`                     | 按输入条件输出 |
| REALITY            | `reality-base64-pubkey / reality-hex-shortid`  | `String`                    | 全局分支追加                                  | 否             | 未限定                                            | `key / 0123456789abcdef`   | 按输入条件输出 |
| VLESS              | `vless-flow`                                   | `String`                    | 来源 flow                                     | 否             | 空 / xtls-rprx-vision；其他 flow 抛错             | `xtls-rprx-vision`         | 按输入条件输出 |
| UDP                | `udp-relay`                                    | `Boolean 文本`              | 有源值时写，保留 false                        | 否             | 未限定                                            | `false`                    | 按输入条件输出 |
| SS UOT             | `udp-over-tcp`                                 | `Boolean 文本 / String`     | 按来源 version                                | 否             | true / sp.v1 / sp.v2，按分支                      | `sp.v2`                    | 按输入条件输出 |
| TFO                | `fast-open`                                    | `Boolean 文本`              | 来源 tfo                                      | 否             | 未限定                                            | `false`                    | 按输入条件输出 |
| 测速               | `server_check_url`                             | `String`                    | 来源 test-url                                 | 否             | 未限定                                            | `https://example.com`      | 按输入条件输出 |

公共位置字段和文本语义见[INI 公共字段](ini-common.md)。

## 能力与约束

支持 SS、SSR、Trojan、VMess、VLESS、HTTP、SOCKS5、AnyTLS；SSR 以 shadowsocks 行表达。HTTPUpgrade 过滤。ALPN 是 TLS wire 字节的 hex，不是普通逗号列表。
