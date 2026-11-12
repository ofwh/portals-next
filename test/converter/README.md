# 订阅转换对比

使用 Sakura 和 Flower 两条订阅合并生成。应用结果取自运行中的开发站点，工作流已通过订阅管理使用的 API 保存。原有订阅保留。

| 格式 | 本地订阅路径（前缀 `http://localhost:3000`） | 应用输出 | subconverter 输出 |
| --- | --- | --- | --- |
| Mixed | `/s/test/converter/mixed` | [mixed.txt](app/mixed.txt) | [mixed.txt](subconverter/mixed.txt) |
| Clash | `/s/test/converter/clash` | [clash.yaml](app/clash.yaml) | [clash.yaml](subconverter/clash.yaml) |
| Quantumult X | `/s/test/converter/quanx` | [quanx.conf](app/quanx.conf) | [quanx.conf](subconverter/quanx.conf) |
| sing-box | `/s/test/converter/singbox` | [singbox.json](app/singbox.json) | [singbox.json](subconverter/singbox.json) |

原始输出包含代理凭据。输出文件权限为 `0600`，两份输出目录由 Git 忽略。

## 重命名与过滤

两端四种格式均输出 191 个节点，逐格式的节点名称集合相同。节点名中 `IEPL|专线|中继|流量`、emoji、`剩余|套餐` 的残留均为 0。[重命名与过滤统计](comparison/rename.json)

## 规则与策略

| 格式 | 对比结果 |
| --- | --- |
| Mixed | URI 订阅格式，两端均无规则或策略组。 |
| Clash | 16 条规则的内容、顺序、策略目标一致。13 个 provider 的名称、来源、类型、行为和更新间隔一致。两端的缓存路径不同，应用显式输出 `format: yaml`。16 个策略组定义及成员顺序一致。[Clash 对照](comparison/clash.json) |
| Quantumult X | 两端 HTTP 200。21 条远程规则和 17 个策略组逐行一致。15 条本地规则中，13 条逐行一致，2 条 IPv6 规则的类型名称不同。[Quantumult X 对照](comparison/quanx.json) |
| sing-box | 不一致。应用生成 21 个 `route.rule_set`，subconverter 生成 0 个，并将多标签匹配截为首个标签，例如广告规则缺少 `personal-ad-block`。应用生成 9 个业务 selector，subconverter 未生成这些 selector，部分路由策略和 `route.final` 因此缺少同名出站。两端的 DNS 规则和 `route.final` 字符串相同。[sing-box 对照](comparison/singbox.json) |

### 请求口径

应用在重命名后排除名称匹配 `剩余|套餐` 的节点，subconverter 请求增加同一 `exclude` 正则。

Clash 和 sing-box 两端分别使用用户提供的对应规则及模板。subconverter 端将外部 INI 和模板地址合并，用 Base64URL 编码的 data URI 传入 `config`，显式开启规则生成并保留模板规则。Clash 对照使用 `expand=false`。Quantumult X 同样使用 `expand=false`，两端采用已发布的规则与模板。远程列表正文和客户端匹配行为未核验。[规则 INI](https://p.bofoi.com/b/ruleset/quanx) · [模板](https://p.bofoi.com/b/tpl/quanx)

## 两端输出逐项对照

[查看全部输出差异](DIFFERENCES.md)

| 格式 | 检查项 | 当前应用 | subconverter | 结论 |
| --- | --- | --- | --- | --- |
| 全部四种格式 | 节点名中的 IEPL、专线、中继、流量 | 0 个残留 | 0 个残留 | 一致 |
| 全部四种格式 | 节点名中的 emoji | 0 个残留 | 0 个残留 | 一致 |
| 全部四种格式 | 节点名过滤（剩余、套餐） | 0 个残留 | 0 个残留 | 一致 |
| 全部四种格式 | 节点数量与名称 | 每种 191 个 | 每种 191 个 | 一致。逐格式的名称集合相同 |
| Mixed | 输出及规则策略 | URI 订阅，无路由规则、规则集或策略组 | URI 订阅，无路由规则、规则集或策略组 | 一致 |
| Clash | `rules` | 16 条，末条为 `MATCH,规则之外` | 16 条，末条为 `MATCH,规则之外` | 一致。规则内容、顺序和策略目标逐条相同 |
| Clash | `rule-providers` 定义 | 13 个，更新间隔均为 86,400 秒 | 13 个，更新间隔均为 86,400 秒 | 一致。名称、URL、类型、行为及更新间隔相同 |
| Clash | provider 输出字段 | 显式写 `format: yaml`，缓存文件名包含规则集名称和行为 | 省略 `format`，缓存文件名为数字哈希 | 差异。涉及字段表示和本地缓存路径。[查看详情](DIFFERENCES.md#clash-providers) |
| Clash | 策略组名称、类型和健康检查 | 16 个组 | 16 个组 | 一致。组名称、类型及健康检查 URL、间隔和容差相同 |
| Clash | 策略组成员 | 16 个组，`AI服务` 199 个、`其他节点` 79 个 | 同左 | 一致。成员及顺序相同 |
| Quantumult X | `filter_remote` | 21 条 | 21 条 | 一致。URL、参数和顺序逐行相同 |
| Quantumult X | `policy` | 17 个策略组 | 17 个策略组 | 一致。策略组、成员、测速参数和顺序逐行相同 |
| Quantumult X | `filter_local` | 15 条，IPv6 类型为 `IP6-CIDR` | 15 条，IPv6 类型为 `IP-CIDR6` | 差异。2 条关键字不同，网段、策略和顺序相同。[查看详情](DIFFERENCES.md#quanx-ipv6) |
| Quantumult X | DNS 模板 | 7 行 `server = …` | 7 行 `server=…` | 差异。仅等号两侧空格，9 条 DNS 设置的值及顺序相同。[查看详情](DIFFERENCES.md#quanx-dns) |
| Quantumult X | `server_local` UDP 字段 | 90 个节点显式输出 `udp-relay=true` | 对应节点省略 `udp-relay` | 差异。191 个节点名称及顺序相同。[查看详情](DIFFERENCES.md#quanx-udp) |
| sing-box | 模板路由动作 | 保留 `sniff`、`hijack-dns` | 保留 `sniff`、`hijack-dns` | 一致。两条动作及匹配条件相同 |
| sing-box | `route.rules` 条数及模式规则 | 14 条，无 `clash_mode` 规则 | 16 条，新增 Global 和 Direct 模式规则 | 差异。多 2 条模式规则。[查看详情](DIFFERENCES.md#singbox-mode-rules) |
| sing-box | 私有 IP 与拒绝动作 | 私有 IP 用 `ip_is_private: true`，广告用 `action: reject` | 私有 IP 用 `private: "true"`，广告用 `outbound: REJECT` | 差异。匹配字段和拒绝表示不同。[查看详情](DIFFERENCES.md#singbox-private-reject) |
| sing-box | `route.rule_set` | 21 个远程规则集定义 | 0 个定义 | 差异。subconverter 输出的规则集引用缺少对应定义。[查看详情](DIFFERENCES.md#singbox-rule-sets) |
| sing-box | `rule_set` 匹配标签 | 保留配置中的完整标签列表 | 8 条多标签规则均只保留首个标签 | 差异。具体缺失标签见详情。[查看详情](DIFFERENCES.md#singbox-rule-tags) |
| sing-box | 策略组定义 | 16 个组，含 9 个业务 selector | 8 个组，含额外的 `GLOBAL` selector | 差异。subconverter 缺少 `手动选择`、`AI服务`、`Apple服务`、`Google服务`、`Telegram服务`、`Microsoft服务`、`Netflix服务`、`Disney+服务`、`规则之外`。[查看详情](DIFFERENCES.md#singbox-groups) |
| sing-box | 共有策略组 | 7 个，`其他优选` 有 79 个成员 | 同左 | 一致。组名称、类型、成员及成员顺序相同 |
| sing-box | DNS 规则 | 2 条 | 2 条 | 一致。内容和顺序相同 |
| sing-box | `route.final` | `规则之外`，存在对应出站 | `规则之外`，缺少对应出站 | 字段值一致，引用完整性有差异。[查看详情](DIFFERENCES.md#singbox-final) |


[Quantumult X 规则策略 INI](quanx.ini) 含 21 条远程规则、15 条本地规则和 17 个策略组。远程 URL 沿用输入配置。「域名直连」原条目未指定强制策略，转换后使用 `direct`。策略图标、`alive-checking`、远程规则的 `tag` 和 `opt-parser` 无对应 INI 字段。测速组使用解析器所需的探测 URL，Quantumult X 编译器从节点名称展开成员。
