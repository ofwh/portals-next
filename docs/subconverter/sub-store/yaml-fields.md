# YAML 节点字段

本表是 YAML producer 共享的字段词汇，不是所有目标共同支持的闭合 schema。各目标的准入和字段改写见独立页面。公共名称、端点、UDP、TFO、TLS 定义见[公共字段](common.md)。未枚举的开放嵌套对象不得推断类型或默认值。

## SS

| 节点 / 范围 | 字段                   | 类型                               | 默认值 / 缺省行为 | 必须               | 选项 / 约束                                    | 示例                                    | 映射说明                                                       |
| ----------- | ---------------------- | ---------------------------------- | ----------------- | ------------------ | ---------------------------------------------- | --------------------------------------- | -------------------------------------------------------------- |
| SS          | `type`                 | `String`                           | ss                | 是                 | ss                                             | `ss`                                    | 协议判别字段                                                   |
| SS          | `cipher`               | `String`                           | 未声明            | 是：加密方法       | 未限定                                         | `aes-128-gcm`                           | 按输入条件输出                                                 |
| SS          | `password`             | `String`                           | 未声明            | 条件：加密方法要求 | 未限定                                         | `secret`                                | 按输入条件输出                                                 |
| SS          | `plugin`               | `String`                           | 未声明            | 否                 | obfs / v2ray-plugin / shadow-tls，目标各自限制 | `obfs`                                  | 按输入条件输出                                                 |
| SS          | `plugin-opts`          | `Object`                           | 未声明            | 否                 | 未限定                                         | `{mode: http, host: cover.example.com}` | 插件选项必须保持对象，不能直接复用 SIP003 字符串               |
| SS          | `plugin-opts.mode`     | `String`                           | 未声明            | 条件：插件模式     | obfs: http/tls；其他按目标                     | `http`                                  | 按输入条件输出                                                 |
| SS          | `plugin-opts.host`     | `String`                           | 未声明            | 否                 | 未限定                                         | `cover.example.com`                     | 按输入条件输出                                                 |
| SS          | `plugin-opts.path`     | `String`                           | 未声明            | 否                 | 未限定                                         | `/ws`                                   | 按输入条件输出                                                 |
| SS          | `plugin-opts.tls`      | `Boolean`                          | 未声明            | 否                 | 未限定                                         | `true`                                  | 按输入条件输出                                                 |
| SS          | `plugin-opts.mux`      | `Boolean / Number / 可解析 String` | 未声明            | 否                 | 未限定                                         | `0`                                     | Clash.Meta 可归一 Boolean；URI/sing-box 的插件选项保留数值语义 |
| SS          | `udp-over-tcp`         | `Boolean`                          | 未声明            | 否                 | 未限定                                         | `true`                                  | 按输入条件输出                                                 |
| SS          | `udp-over-tcp-version` | `Number`                           | 未声明            | 否                 | 1 / 2，须目标支持                              | `2`                                     | 按输入条件输出                                                 |

## SSR

| 节点 / 范围 | 字段             | 类型     | 默认值 / 缺省行为 | 必须 | 选项 / 约束 | 示例                 | 映射说明       |
| ----------- | ---------------- | -------- | ----------------- | ---- | ----------- | -------------------- | -------------- |
| SSR         | `type`           | `String` | ssr               | 是   | ssr         | `ssr`                | 按输入条件输出 |
| SSR         | `cipher`         | `String` | 未声明            | 是   | 未限定      | `aes-128-cfb`        | 按输入条件输出 |
| SSR         | `password`       | `String` | 未声明            | 是   | 未限定      | `secret`             | 按输入条件输出 |
| SSR         | `protocol`       | `String` | 未声明            | 是   | 未限定      | `auth_aes128_sha1`   | 按输入条件输出 |
| SSR         | `protocol-param` | `String` | 未声明            | 否   | 未限定      | `123:secret`         | 按输入条件输出 |
| SSR         | `obfs`           | `String` | 未声明            | 是   | 未限定      | `tls1.2_ticket_auth` | 按输入条件输出 |
| SSR         | `obfs-param`     | `String` | 未声明            | 否   | 未限定      | `cover.example.com`  | 按输入条件输出 |

## VMess

| 节点 / 范围 | 字段         | 类型      | 默认值 / 缺省行为   | 必须 | 选项 / 约束                                              | 示例              | 映射说明       |
| ----------- | ------------ | --------- | ------------------- | ---- | -------------------------------------------------------- | ----------------- | -------------- |
| VMess       | `type`       | `String`  | vmess               | 是   | vmess                                                    | `vmess`           | 按输入条件输出 |
| VMess       | `uuid`       | `String`  | 未声明              | 是   | 未限定                                                   | `UUID`            | 按输入条件输出 |
| VMess       | `alterId`    | `Number`  | aead=true 时设为 0  | 否   | 未限定                                                   | `0`               | 按输入条件输出 |
| VMess       | `cipher`     | `String`  | 规范化函数决定      | 否   | auto / aes-128-gcm / chacha20-poly1305 / none 等目标集合 | `auto`            | 按输入条件输出 |
| VMess       | `tls`        | `Boolean` | 未声明              | 否   | 未限定                                                   | `true`            | 按输入条件输出 |
| VMess       | `servername` | `String`  | 来源 sni 存在时覆盖 | 否   | 未限定                                                   | `tls.example.com` | 按输入条件输出 |

## VLESS

| 节点 / 范围 | 字段              | 类型      | 默认值 / 缺省行为   | 必须 | 选项 / 约束                         | 示例               | 映射说明                              |
| ----------- | ----------------- | --------- | ------------------- | ---- | ----------------------------------- | ------------------ | ------------------------------------- |
| VLESS       | `type`            | `String`  | vless               | 是   | vless                               | `vless`            | 按输入条件输出                        |
| VLESS       | `uuid`            | `String`  | 未声明              | 是   | 未限定                              | `UUID`             | 按输入条件输出                        |
| VLESS       | `flow`            | `String`  | 未声明              | 否   | 典型 xtls-rprx-vision；目标可能禁止 | `xtls-rprx-vision` | 按输入条件输出                        |
| VLESS       | `encryption`      | `String`  | 未声明              | 否   | 未限定                              | `none`             | 透传目标不等于支持所有新的 encryption |
| VLESS       | `tls`             | `Boolean` | 未声明              | 否   | 未限定                              | `true`             | 按输入条件输出                        |
| VLESS       | `servername`      | `String`  | 来源 sni 存在时覆盖 | 否   | 未限定                              | `tls.example.com`  | 按输入条件输出                        |
| VMess/VLESS | `packet-encoding` | `String`  | 未声明              | 否   | 目标实现决定                        | `xudp`             | 按输入条件输出                        |

## Trojan

| 节点 / 范围 | 字段       | 类型     | 默认值 / 缺省行为 | 必须 | 选项 / 约束 | 示例              | 映射说明       |
| ----------- | ---------- | -------- | ----------------- | ---- | ----------- | ----------------- | -------------- |
| Trojan      | `type`     | `String` | trojan            | 是   | trojan      | `trojan`          | 按输入条件输出 |
| Trojan      | `password` | `String` | 未声明            | 是   | 未限定      | `secret`          | 按输入条件输出 |
| Trojan      | `sni`      | `String` | 未声明            | 否   | 未限定      | `tls.example.com` | 按输入条件输出 |

## Snell

| 节点 / 范围 | 字段             | 类型      | 默认值 / 缺省行为 | 必须 | 选项 / 约束                             | 示例                | 映射说明       |
| ----------- | ---------------- | --------- | ----------------- | ---- | --------------------------------------- | ------------------- | -------------- |
| Snell       | `type`           | `String`  | snell             | 是   | snell                                   | `snell`             | 按输入条件输出 |
| Snell       | `psk`            | `String`  | 未声明            | 是   | 未限定                                  | `secret`            | 按输入条件输出 |
| Snell       | `version`        | `Number`  | 未声明            | 否   | 由各 producer 过滤                      | `3`                 | 按输入条件输出 |
| Snell       | `reuse`          | `Boolean` | 未声明            | 否   | 未限定                                  | `true`              | 按输入条件输出 |
| Snell       | `obfs-opts.mode` | `String`  | 未声明            | 否   | http / tls / shadow-tls；目标和版本限制 | `http`              | 按输入条件输出 |
| Snell       | `obfs-opts.host` | `String`  | 未声明            | 否   | 未限定                                  | `cover.example.com` | 按输入条件输出 |

## HTTP/SOCKS

| 节点 / 范围 | 字段       | 类型                    | 默认值 / 缺省行为 | 必须 | 选项 / 约束   | 示例               | 映射说明                              |
| ----------- | ---------- | ----------------------- | ----------------- | ---- | ------------- | ------------------ | ------------------------------------- |
| HTTP/SOCKS  | `type`     | `String`                | 未声明            | 是   | http / socks5 | `http`             | 按输入条件输出                        |
| HTTP/SOCKS  | `username` | `String`                | 未声明            | 否   | 未限定        | `user`             | 按输入条件输出                        |
| HTTP/SOCKS  | `password` | `String`                | 未声明            | 否   | 未限定        | `secret`           | 按输入条件输出                        |
| HTTP/SOCKS  | `tls`      | `Boolean`               | 未声明            | 否   | 未限定        | `true`             | 部分目标通过此键区分 HTTPS/SOCKS5-TLS |
| HTTP        | `headers`  | `Object<String,String>` | 未声明            | 否   | 未限定        | `{X-Token: value}` | 按输入条件输出                        |

## Hysteria

| 节点 / 范围 | 字段        | 类型              | 默认值 / 缺省行为 | 必须 | 选项 / 约束 | 示例            | 映射说明       |
| ----------- | ----------- | ----------------- | ----------------- | ---- | ----------- | --------------- | -------------- |
| Hysteria    | `type`      | `String`          | hysteria          | 是   | hysteria    | `hysteria`      | 按输入条件输出 |
| Hysteria    | `auth-str`  | `String`          | 未声明            | 否   | 未限定      | `secret`        | 按输入条件输出 |
| Hysteria    | `auth`      | `String`          | 未声明            | 否   | 未限定      | `Base64 认证`   | 按输入条件输出 |
| Hysteria    | `up / down` | `Number / String` | 未声明            | 否   | 未限定      | `100 Mbps`      | 按输入条件输出 |
| Hysteria    | `ports`     | `String`          | 未声明            | 否   | 未限定      | `443,5000-6000` | 按输入条件输出 |
| Hysteria    | `obfs`      | `String`          | 未声明            | 否   | 未限定      | `secret`        | 按输入条件输出 |

## Hysteria2

| 节点 / 范围 | 字段            | 类型              | 默认值 / 缺省行为 | 必须           | 选项 / 约束                  | 示例            | 映射说明       |
| ----------- | --------------- | ----------------- | ----------------- | -------------- | ---------------------------- | --------------- | -------------- |
| Hysteria2   | `type`          | `String`          | hysteria2         | 是             | hysteria2                    | `hysteria2`     | 按输入条件输出 |
| Hysteria2   | `password`      | `String`          | 未声明            | 是             | 未限定                       | `secret`        | 按输入条件输出 |
| Hysteria2   | `up / down`     | `Number / String` | 未声明            | 否             | 未限定                       | `100`           | 按输入条件输出 |
| Hysteria2   | `ports`         | `String`          | 未声明            | 否             | 未限定                       | `443,5000-6000` | 按输入条件输出 |
| Hysteria2   | `hop-interval`  | `Number / String` | 未声明            | 否             | 未限定                       | `30`            | 按输入条件输出 |
| Hysteria2   | `obfs`          | `String`          | 未声明            | 否             | salamander / gecko，目标过滤 | `salamander`    | 按输入条件输出 |
| Hysteria2   | `obfs-password` | `String`          | 未声明            | 条件：启用混淆 | 未限定                       | `obfs-secret`   | 按输入条件输出 |

## TUIC

| 节点 / 范围 | 字段                    | 类型     | 默认值 / 缺省行为 | 必须     | 选项 / 约束                  | 示例     | 映射说明       |
| ----------- | ----------------------- | -------- | ----------------- | -------- | ---------------------------- | -------- | -------------- |
| TUIC        | `type`                  | `String` | tuic              | 是       | tuic                         | `tuic`   | 按输入条件输出 |
| TUIC v4     | `token`                 | `String` | 未声明            | 条件：v4 | 未限定                       | `token`  | 按输入条件输出 |
| TUIC v5     | `uuid`                  | `String` | 未声明            | 条件：v5 | 未限定                       | `UUID`   | 按输入条件输出 |
| TUIC v5     | `password`              | `String` | 未声明            | 条件：v5 | 未限定                       | `secret` | 按输入条件输出 |
| TUIC        | `version`               | `Number` | 未声明            | 否       | 4 / 5，按目标设置            | `5`      | 按输入条件输出 |
| TUIC        | `congestion-controller` | `String` | 未声明            | 否       | 未在所有 producer 中统一校验 | `cubic`  | 按输入条件输出 |
| TUIC        | `udp-relay-mode`        | `String` | 未声明            | 否       | native / quic                | `native` | 按输入条件输出 |

## WireGuard

| 节点 / 范围 | 字段                               | 类型                          | 默认值 / 缺省行为 | 必须           | 选项 / 约束 | 示例                                        | 映射说明           |
| ----------- | ---------------------------------- | ----------------------------- | ----------------- | -------------- | ----------- | ------------------------------------------- | ------------------ |
| WireGuard   | `type`                             | `String`                      | wireguard         | 是             | wireguard   | `wireguard`                                 | 按输入条件输出     |
| WireGuard   | `private-key`                      | `String`                      | 未声明            | 是             | 未限定      | `Base64 私钥`                               | 按输入条件输出     |
| WireGuard   | `public-key`                       | `String`                      | 未声明            | 条件：单 peer  | 未限定      | `Base64 公钥`                               | 按输入条件输出     |
| WireGuard   | `pre-shared-key / preshared-key`   | `String`                      | 未声明            | 否             | 未限定      | `Base64 密钥`                               | 键名兼容按目标归一 |
| WireGuard   | `ip / ipv6`                        | `String`                      | 未声明            | 条件：接口地址 | 未限定      | `10.0.0.2/32`                               | 按输入条件输出     |
| WireGuard   | `peers`                            | `Array<Object>`               | 未声明            | 否             | 未限定      | `[{server: peer.example.com, port: 51820}]` | 按输入条件输出     |
| WireGuard   | `keepalive / persistent-keepalive` | `Number`                      | 未声明            | 否             | 未限定      | `25`                                        | 按输入条件输出     |
| WireGuard   | `reserved`                         | `Array<Number> / 兼容 String` | 未声明            | 否             | 未限定      | `[1,2,3]`                                   | 按输入条件输出     |
| WireGuard   | `dns`                              | `Array<String> / 兼容 String` | 未声明            | 否             | 未限定      | `["1.1.1.1"]`                               | 按输入条件输出     |
| WireGuard   | `mtu`                              | `Number`                      | 未声明            | 否             | 未限定      | `1420`                                      | 按输入条件输出     |

## AnyTLS

| 节点 / 范围 | 字段                          | 类型                   | 默认值 / 缺省行为 | 必须 | 选项 / 约束 | 示例     | 映射说明       |
| ----------- | ----------------------------- | ---------------------- | ----------------- | ---- | ----------- | -------- | -------------- |
| AnyTLS      | `type`                        | `String`               | anytls            | 是   | anytls      | `anytls` | 按输入条件输出 |
| AnyTLS      | `password`                    | `String`               | 未声明            | 是   | 未限定      | `secret` | 按输入条件输出 |
| AnyTLS      | `idle-session-check-interval` | `Number / 输入 String` | 未声明            | 否   | 未限定      | `30`     | 按输入条件输出 |
| AnyTLS      | `idle-session-timeout`        | `Number / 输入 String` | 未声明            | 否   | 未限定      | `30`     | 按输入条件输出 |
| AnyTLS      | `min-idle-session`            | `Number / 输入 String` | 未声明            | 否   | 未限定      | `1`      | 按输入条件输出 |
| AnyTLS      | `disable-reuse`               | `Boolean`              | 未声明            | 否   | 未限定      | `false`  | 按输入条件输出 |

## SSH

| 节点 / 范围 | 字段          | 类型                          | 默认值 / 缺省行为 | 必须           | 选项 / 约束 | 示例                | 映射说明       |
| ----------- | ------------- | ----------------------------- | ----------------- | -------------- | ----------- | ------------------- | -------------- |
| SSH         | `type`        | `String`                      | ssh               | 是             | ssh         | `ssh`               | 按输入条件输出 |
| SSH         | `username`    | `String`                      | 未声明            | 是             | 未限定      | `root`              | 按输入条件输出 |
| SSH         | `password`    | `String`                      | 未声明            | 条件：密码认证 | 未限定      | `secret`            | 按输入条件输出 |
| SSH         | `private-key` | `String`                      | 未声明            | 条件：私钥认证 | 未限定      | `PEM 私钥`          | 按输入条件输出 |
| SSH         | `host-key`    | `Array<String> / 兼容 String` | 未声明            | 否             | 未限定      | `["ssh-ed25519 …"]` | 按输入条件输出 |

## Mieru

| 节点 / 范围 | 字段           | 类型     | 默认值 / 缺省行为 | 必须 | 选项 / 约束      | 示例                | 映射说明       |
| ----------- | -------------- | -------- | ----------------- | ---- | ---------------- | ------------------- | -------------- |
| Mieru       | `type`         | `String` | mieru             | 是   | mieru            | `mieru`             | 按输入条件输出 |
| Mieru       | `username`     | `String` | 未声明            | 是   | 未限定           | `user`              | 按输入条件输出 |
| Mieru       | `password`     | `String` | 未声明            | 是   | 未限定           | `secret`            | 按输入条件输出 |
| Mieru       | `port-range`   | `String` | 未声明            | 否   | 未限定           | `5000-6000`         | 按输入条件输出 |
| Mieru       | `transport`    | `String` | 未声明            | 否   | 按来源与目标支持 | `TCP`               | 按输入条件输出 |
| Mieru       | `multiplexing` | `String` | 未声明            | 否   | 未限定           | `MULTIPLEXING_HIGH` | 按输入条件输出 |

## Tailscale

| 节点 / 范围 | 字段                          | 类型      | 默认值 / 缺省行为 | 必须 | 选项 / 约束 | 示例                          | 映射说明       |
| ----------- | ----------------------------- | --------- | ----------------- | ---- | ----------- | ----------------------------- | -------------- |
| Tailscale   | `type`                        | `String`  | tailscale         | 是   | tailscale   | `tailscale`                   | 按输入条件输出 |
| Tailscale   | `auth-key`                    | `String`  | 未声明            | 否   | 未限定      | `tskey-auth-…`                | 按输入条件输出 |
| Tailscale   | `hostname`                    | `String`  | 未声明            | 否   | 未限定      | `client`                      | 按输入条件输出 |
| Tailscale   | `control-url`                 | `String`  | 未声明            | 否   | 未限定      | `https://control.example.com` | 按输入条件输出 |
| Tailscale   | `state-dir / state-directory` | `String`  | 未声明            | 否   | 未限定      | `/var/lib/tailscale`          | 按输入条件输出 |
| Tailscale   | `accept-routes`               | `Boolean` | 未声明            | 否   | 未限定      | `true`                        | 按输入条件输出 |
| Tailscale   | `exit-node`                   | `String`  | 未声明            | 否   | 未限定      | `exit-node`                   | 按输入条件输出 |
| Tailscale   | `ephemeral`                   | `Boolean` | 未声明            | 否   | 未限定      | `false`                       | 按输入条件输出 |

## 传输

| 节点 / 范围           | 字段                             | 类型                    | 默认值 / 缺省行为          | 必须 | 选项 / 约束                             | 示例                             | 映射说明                                              |
| --------------------- | -------------------------------- | ----------------------- | -------------------------- | ---- | --------------------------------------- | -------------------------------- | ----------------------------------------------------- |
| VMess/VLESS/Trojan 等 | `network`                        | `String`                | 未声明                     | 否   | 由目标限制 tcp/ws/http/h2/grpc/xhttp 等 | `ws`                             | 按输入条件输出                                        |
| WS                    | `ws-opts.path`                   | `String`                | 缺省 /，具体 producer 决定 | 否   | 未限定                                  | `/ws`                            | 按输入条件输出                                        |
| WS                    | `ws-opts.headers`                | `Object<String,String>` | 未声明                     | 否   | 未限定                                  | `{Host: ws.example.com}`         | 按输入条件输出                                        |
| WS                    | `ws-opts.max-early-data`         | `Number`                | 未声明                     | 否   | 未限定                                  | `2048`                           | 按输入条件输出                                        |
| WS                    | `ws-opts.early-data-header-name` | `String`                | 未声明                     | 否   | 未限定                                  | `Sec-WebSocket-Protocol`         | 按输入条件输出                                        |
| gRPC                  | `grpc-opts.grpc-service-name`    | `String`                | 未声明                     | 否   | 未限定                                  | `service`                        | 按输入条件输出                                        |
| gRPC                  | `grpc-opts._grpc-type`           | `String`                | 未声明                     | 否   | gun / multi / 目标扩展                  | `gun`                            | 外部 YAML 可能被清理；URI 可投影为 mode               |
| gRPC                  | `grpc-opts._grpc-authority`      | `String`                | 未声明                     | 否   | 未限定                                  | `grpc.example.com`               | 外部 YAML 可能被清理；URI 可投影为 authority          |
| HTTP/H2               | `http-opts / h2-opts`            | `Object`                | 未声明                     | 否   | 未限定                                  | `{path: /, host: [example.com]}` | 按输入条件输出                                        |
| XHTTP                 | `xhttp-opts`                     | `Object`                | 未声明                     | 否   | 未限定                                  | `{path: /xhttp, mode: auto}`     | 结构化上下行、xmux、extra 需目标专门支持；不能转成 WS |
