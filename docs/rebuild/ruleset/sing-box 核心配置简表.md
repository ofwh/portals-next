# sing-box 核心配置简表

仅整理节点、节点组、remote 规则集，以及出站转发、直连、拒绝和最终出站。以下为配置约定；新增写法尚待实现。

依据：[原始 auto.json](/Users/larify/Documents/workspace/Profiles/sing-box/base/v1.13.x/auto.json)、[通用 ruleset 格式](/Users/larify/Documents/workspace/portals-next/docs/rebuild/ruleset/ruleset-formats.md)、[已有设计](/Users/larify/Documents/workspace/portals-next/docs/rebuild/ruleset/sing-box%20配置规则设计.md)。

## 1. 配置格式

外部 INI 放在 `[custom]`。`<…>` 为占位值，`[…]` 为可选部分；成员前的 `[]` 是实际语法。

### custom_proxy_group

```ini
; 通用选择组、测速组：复用已有格式
custom_proxy_group=<组名>`select`<成员1>`<成员2>...
custom_proxy_group=<组名>`url-test`<成员1>`<成员2>...[`<测速URL>`<间隔秒数>,,<容差毫秒>]

; 需要 sing-box 的连接中断开关时，使用已有设计中的 selector 扩展
custom_proxy_group=<组名>`selector`<成员1>`<成员2>...`<interrupt_exist_connections>
```

成员使用 `[]名称` 精确引用节点或组，普通正则筛选订阅节点。代理节点继续来自订阅，不新增 `custom_proxy_group` 节点定义格式。`url-test` 中间空位是旧 timeout 位置，不映射为 sing-box 字段。测速尾部可省略，保留尾部时其中的 URL、周期及容差也可留空，未设置字段不输出。urltest 与 url-test 使用同一解析方式；不支持其他分组类型。

### ruleset

```ini
; 通用规则来源：保留原有格式，由转换器转换规则内容
ruleset=<策略>,<通用来源>[,<更新秒数>]

; sing-box 原生 remote：新增来源前缀，复用已有设计的位置
ruleset=<策略可空>,<singbox|singbox-source|singbox-binary>:<URL>[,<更新秒数>[,<tag>[,<下载出站>]]]

; 通用内联匹配、规则集引用及最终出站
ruleset=<策略>,[]<规则类型>,<值>
ruleset=<策略>,[]RULE-SET,<tag1>[,<tag2>...]
ruleset=<出站>,[]FINAL
```

通用来源沿用无前缀、`surge:`、`quanx:`、`clash-domain:`、`clash-ipcidr:`、`clash-classic:`。策略使用节点名、组名、`DIRECT` 或 `REJECT`；FINAL 只接受出站，放在最后。

新增 `singbox:` 表示 format 省略，由 URL 的 `.json` / `.srs` 推断；无法推断时使用 `singbox-source:` / `singbox-binary:` 显式指定。仅接收 HTTP(S) remote。

remote 的策略为空时只定义，非空时定义并生成一条引用。尾部可省略，中间空位保留逗号；引用已有名称时显式填写 tag。更新间隔省略或留空时，解析结果不含 interval，编译结果不含 update_interval，由 sing-box 使用自身默认值，tag 省略由转换器命名，下载出站省略则不输出该字段。

## 2. 配置项与目标映射

### 节点与节点组

| 输入或来源                 | sing-box 目标字段及关系                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| 订阅节点                   | 由原节点转换器生成 `outbounds[]` 的协议、tag、server 等字段；本次不扩展                        |
| 组名                       | `outbounds[].tag`                                                                              |
| `select` / `selector`      | `outbounds[].type="selector"`                                                                  |
| `url-test`                 | `outbounds[].type="urltest"`                                                                   |
| `[]香港优选`               | 原文件的 `tag://香港优选` → 输出成员 `"香港优选"`                                              |
| `(香港)`                   | 原文件的 `include://(香港)` → 匹配节点后展开为成员 tag                                         |
| `selector` 末段 `true`     | `interrupt_exist_connections=true`                                                             |
| 测速 URL、`60,,50`         | `url`、`interval="60s"`、`tolerance=50`                                                        |
| `[]DIRECT` / 策略 `DIRECT` | 引用 `{"type":"direct","tag":"DIRECT"}`；原文件的 `direct` 及其引用在本次映射中统一为 `DIRECT` |

```ini
custom_proxy_group=手动选择`selector`[]自动选择`(港)`[]DIRECT`true
custom_proxy_group=香港优选`url-test`(香港)`https://www.gstatic.com/generate_204`60,,50
```

对应分组输出（假设订阅中匹配到“香港节点1”）：

```json
[
  {
    "type": "selector",
    "tag": "手动选择",
    "outbounds": ["自动选择", "香港节点1", "DIRECT"],
    "interrupt_exist_connections": true
  },
  {
    "type": "urltest",
    "tag": "香港优选",
    "outbounds": ["香港节点1"],
    "url": "https://www.gstatic.com/generate_204",
    "interval": "60s",
    "tolerance": 50
  }
]
```

### remote 定义与引用

```ini
ruleset=,singbox:https://raw.githubusercontent.com/ofwh/Profiles/refs/heads/main/sing-box/Rules/Proxy.json,,personal-proxy,手动选择
ruleset=手动选择,[]RULE-SET,personal-proxy,personal-specify-proxy,geosite-18comic
```

| 配置项                                                                      | 目标映射                                                                                                                                               |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 第一条：来源类型、URL                                                       | `route.rule_set[]` 的 `type="remote"`、`url`；`singbox:` 不输出 format                                                                                 |
| 第一条：空策略、空间隔                                                      | 不生成路由引用；省略 update_interval，由核心处理缺省值                                                                                                 |
| 第一条：`personal-proxy,手动选择`                                           | `tag="personal-proxy"`、`download_detour="手动选择"`                                                                                                   |
| 来源改为 `singbox-source:` / `singbox-binary:`                              | 额外输出 `format="source"` / `"binary"`                                                                                                                |
| 第二条：策略、多个 tag                                                      | `route.rules[]`：`{"outbound":"手动选择","rule_set":["personal-proxy","personal-specify-proxy","geosite-18comic"]}`；保持一条规则，引用的 tag 均需定义 |
| 合并写法：`ruleset=AI服务,singbox-binary:<URL>,,geosite-global-ai,手动选择` | 同时生成 remote 定义和 `{"rule_set":"geosite-global-ai","outbound":"AI服务"}`                                                                          |

### 基础路由

| ruleset 示例                                                           | sing-box 目标                                                                                      |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `ruleset=手动选择,[]DOMAIN-SUFFIX,example.com`                         | `route.rules[]`：`{"domain_suffix":["example.com"],"outbound":"手动选择"}`                         |
| `ruleset=DIRECT,[]PRIVATE,true`                                        | `route.rules[]`：`{"ip_is_private":true,"outbound":"DIRECT"}`；保留原文件语义，新增匹配指令        |
| `ruleset=DIRECT,[]IP-CIDR,192.168.0.0/16`                              | `route.rules[]`：`{"ip_cidr":["192.168.0.0/16"],"outbound":"DIRECT"}`                              |
| `ruleset=REJECT,[]RULE-SET,geosite-category-ads-all,personal-ad-block` | `route.rules[]`：`{"rule_set":["geosite-category-ads-all","personal-ad-block"],"action":"reject"}` |
| `ruleset=DIRECT,[]RULE-SET,personal-direct,geosite-cn,geoip-cn`        | `route.rules[]`：`{"rule_set":["personal-direct","geosite-cn","geoip-cn"],"outbound":"DIRECT"}`    |
| `ruleset=规则之外,[]FINAL`                                             | `route.final="规则之外"`；不生成 `route.rules[]` 项                                                |

本次不展开 local/inline 规则集、逻辑规则及 sniff/hijack-dns 等动作；原文件对应内容继续由基础模板提供。
