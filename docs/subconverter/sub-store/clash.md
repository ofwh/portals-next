# Clash 输出类型

依据：[clash.js](https://github.com/sub-store-org/Sub-Store/blob/352f01b7091c99f4e219c44e4ec96f3288059843/backend/src/core/proxy-utils/producers/clash.js)。表格的类型和缺省语义遵守[阅读约定](README.md#阅读约定)。

## schema

YAML 代理列表，默认以 flow mapping 写每个节点；pretty-yaml 选项可改变排版，不改变结构。

```yaml
proxies:
  - { type: ss, name: Example, server: proxy.example.com, port: 443, cipher: aes-128-gcm, password: secret, udp: true }
```

## 参数

全部显式字段、嵌套路径、私有输入、删除规则、枚举及动态参数见[逐参数全表](parameters/clash.md)。以下表格解释主要字段的协议语义；共享字段通过公共表完整维护。

| 节点 / 范围     | 字段                                    | 类型              | 默认值 / 缺省行为        | 必须 | 选项 / 约束 | 示例              | 映射说明         |
| --------------- | --------------------------------------- | ----------------- | ------------------------ | ---- | ----------- | ----------------- | ---------------- |
| VMess           | `cipher`                                | `String`          | Clash 专用归一化         | 否   | 未限定      | `auto`            | 按输入条件输出   |
| VMess/VLESS     | `servername`                            | `String`          | sni 存在时复制并移除 sni | 否   | 未限定      | `tls.example.com` | 按输入条件输出   |
| HTTP/H2         | `http-opts.path / h2-opts.host`         | `Array<String>`   | 单值转数组               | 否   | 未限定      | `["/"]`           | 按输入条件输出   |
| WS              | `ws-opts.path`                          | `String`          | 缺省 /                   | 否   | 未限定      | `/ws`             | 按输入条件输出   |
| Snell version<3 | `udp`                                   | `不输出`          | 删除                     | 否   | 未限定      | —                 | 该版本不携带 UDP |
| WireGuard       | `persistent-keepalive / pre-shared-key` | `Number / String` | 兼容别名复制             | 否   | 未限定      | `25`              | 按输入条件输出   |

节点参数继承[公共字段](common.md)和[YAML 节点字段](yaml-fields.md)，仅在目标准入范围内适用。下表列出 producer 明确的字段差异，非闭合 schema。

## 能力与约束

默认仅准入 SS、SSR、VMess、VLESS、HTTP、SOCKS5、Snell、Trojan、WireGuard。Snell version≥4、VLESS flow/REALITY、HTTPUpgrade、前置代理均过滤。支持集合不等同于 Clash.Meta。
