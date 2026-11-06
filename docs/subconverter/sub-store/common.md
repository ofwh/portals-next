# 公共字段与类型

这些字段定义 Sub-Store producer 接收的常见规范化节点；并非每个目标都保留全部字段。不同输出的真实键名、类型与默认行为见对应表。无服务器端点的 Tailscale 等节点不套用 server/port 必填约束。

| 节点 / 范围         | 字段                                                    | 类型                              | 默认值 / 缺省行为 | 必须          | 选项 / 约束                       | 示例                | 映射说明                                                  |
| ------------------- | ------------------------------------------------------- | --------------------------------- | ----------------- | ------------- | --------------------------------- | ------------------- | --------------------------------------------------------- |
| 所有常规节点        | `name`                                                  | `String`                          | 未声明            | 是：显示标识  | 未限定                            | `香港 01`           | sing-box 映射为 tag；URI 通常映射到 fragment              |
| 普通远端节点        | `server`                                                | `String`                          | 未声明            | 是：端点节点  | 未限定                            | `proxy.example.com` | 域名或 IP；原生对象不是带端口 URL                         |
| 普通远端节点        | `port`                                                  | `Number / 输入可为数字 String`    | 未声明            | 是：端点节点  | 有效端口；producer 并非统一校验器 | `443`               | JSON 投影可能 parseInt；不能据此允许新实现截断非法输入    |
| 支持 UDP 的节点     | `udp`                                                   | `Boolean`                         | 未声明            | 否            | 未限定                            | `true`              | YAML 可保留；其他目标按独立映射表处理；未声明不等于 false |
| 支持 TFO 的节点     | `tfo`                                                   | `Boolean`                         | 未声明            | 否            | 未限定                            | `false`             | 不是 UDP 开关；不可用 truthy 判断丢失 false               |
| TLS 节点            | `skip-cert-verify`                                      | `Boolean`                         | 未声明            | 否            | 未限定                            | `false`             | 证书校验放宽开关；与 SNI、指纹分别处理                    |
| TLS 节点            | `sni / servername`                                      | `String`                          | 未声明            | 否            | 未限定                            | `tls.example.com`   | 具体输出键随目标及协议变化                                |
| TLS 节点            | `alpn`                                                  | `Array<String> / 目标兼容 String` | 未声明            | 否            | 未限定                            | `["h2","http/1.1"]` | QX 编码为 TLS 长度前缀十六进制；不能直接逗号拼接          |
| TLS 节点            | `client-fingerprint`                                    | `String`                          | 未声明            | 否            | 未限定                            | `chrome`            | 客户端握手指纹；不是服务端证书指纹                        |
| 支持 REALITY 的节点 | `reality-opts.public-key`                               | `String`                          | 未声明            | 条件：REALITY | 未限定                            | `Base64URL 公钥`    | 别名转换必须按目标进行                                    |
| 支持 REALITY 的节点 | `reality-opts.short-id`                                 | `String`                          | 未声明            | 否            | 未限定                            | `0123456789abcdef`  | 不能转换为 Number 丢失前导零                              |
| 前置代理            | `dialer-proxy / underlying-proxy`                       | `String`                          | 未声明            | 否            | 未限定                            | `前置节点`          | JSON 目标可能映射 detour；禁止当元数据删除                |
| 来源元数据          | `subName / collectionName / id / resolved / no-resolve` | `来源类型`                        | 外部序列化时清理  | 否            | 未限定                            | —                   | 不作为协议参数输出                                        |
