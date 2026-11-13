# 订阅转换对比

应用端直接调用订阅管理中的现有路由。两端均使用 Sakura、Flower 两条订阅，去除名称中的 `IEPL|专线|中继|流量` 和 emoji，过滤名称含 `剩余|套餐` 的节点。subconverter 使用 `expand=false`，Surge 另用 `ver=4`。有模板的目标向 subconverter 提交同一份规则 INI 与对应模板地址。

| 格式         | 规则策略 INI                                                      | 模板                                                   |
| ------------ | ----------------------------------------------------------------- | ------------------------------------------------------ |
| Mixed        | 无                                                                | 无                                                     |
| Clash        | [meta/auto](https://p.bofoi.com/b/ruleset/meta/auto)              | [meta/auto](https://p.bofoi.com/b/tpl/meta/auto)       |
| Quantumult X | [quanx](https://p.bofoi.com/b/ruleset/quanx)                      | [quanx](https://p.bofoi.com/b/tpl/quanx)               |
| sing-box     | [singbox/auto](https://p.bofoi.com/b/ruleset/singbox/auto)        | [singbox/auto](https://p.bofoi.com/b/tpl/singbox/auto) |
| Surge        | [surge](https://p.bofoi.com/b/ruleset/surge)                      | [surge](https://p.bofoi.com/b/tpl/surge)               |
| Surfboard    | [surfboard](https://p.bofoi.com/b/ruleset/surfboard)              | [surfboard](https://p.bofoi.com/b/tpl/surfboard)       |
| Loon         | 现有工作流的 [meta/auto](https://p.bofoi.com/b/ruleset/meta/auto) | 应用为空，subconverter 使用默认模板                    |

比较范围为生成的模板字段、规则、规则集引用、策略组和节点名称。远程规则正文、代理连接参数和客户端行为未核验。七种格式的两端请求均返回 HTTP 200。

## 一致项

† Clash 与 Quantumult X 的输出细节见对应明细。标记所列的一致范围按检查项计算。

| 格式         | 一致内容                                                                          | 备注                                                        |
| ------------ | --------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 全部七种格式 | 每端各 191 个节点，逐格式名称及顺序一致，重命名和过滤关键词及 emoji 残留均为 0    |                                                             |
| Mixed        | 两端均为 URI 节点订阅，无规则和策略组                                             |                                                             |
| Clash        | 16 条规则、16 个策略组、模板字段一致，13 个 provider 的来源、行为、更新间隔一致   | † [缓存路径和格式字段](differences/clash.md)                |
| Quantumult X | 21 条远程规则逐行一致，18 条本地规则中 12 条逐行一致，17 个策略组中 10 个逐行一致 | † [本地规则、测速组、DNS 和 UDP 字段](differences/quanx.md) |
| sing-box     | DNS、模板中的 `sniff` 和 `hijack-dns` 一致。7 个共有策略组的成员顺序一致          |                                                             |
| Surge        | 13 条远程规则、3 条本地规则、`[General]` 和 15 个策略组定义逐条一致               |                                                             |
| Surfboard    | 3 条本地规则、`[General]` 和 16 个策略组逐条一致                                  |                                                             |
| Loon         | 3 条本地规则、13 条远程规则和 16 个策略组逐条一致，各段内顺序相同                 |                                                             |

## 差异项

| 格式      | 当前应用                                                    | subconverter                                                                                        | 明细                                  |
| --------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------- |
| sing-box  | 14 条路由规则、21 个规则集定义、16 个策略组，保留多标签匹配 | 16 条路由规则、0 个规则集定义、8 个策略组，8 条多标签规则只保留首个标签，`route.final` 缺少同名出站 | [sing-box](differences/singbox.md)    |
| Surge     | `Apple服务` 输出 3 个动态策略字段                           | `Apple服务` 只输出相同的静态成员                                                                    | [Surge](differences/surge.md)         |
| Surfboard | 输出 13 条远程 `RULE-SET`，保留原 URL、策略和更新间隔       | 输出 0 条远程规则                                                                                   | [Surfboard](differences/surfboard.md) |
| Loon      | 空模板，先写 `[Remote Rule]` 再写 `[Rule]`                  | 默认模板多 7 个配置段，先写 `[Rule]` 再写 `[Remote Rule]`                                           | [Loon](differences/loon.md)           |

## 原始输出

原始响应含代理凭据，文件权限为 `0600`，输出目录由 Git 忽略。

| 格式         | 本地订阅路径                  | 当前应用                   | subconverter                        |
| ------------ | ----------------------------- | -------------------------- | ----------------------------------- |
| Mixed        | `/s/test/converter/mixed`     | [输出](app/mixed.txt)      | [输出](subconverter/mixed.txt)      |
| Clash        | `/s/test/converter/clash`     | [输出](app/clash.yaml)     | [输出](subconverter/clash.yaml)     |
| Quantumult X | `/s/test/converter/quanx`     | [输出](app/quanx.conf)     | [输出](subconverter/quanx.conf)     |
| sing-box     | `/s/test/converter/singbox`   | [输出](app/singbox.json)   | [输出](subconverter/singbox.json)   |
| Surge        | `/s/test/converter/surge`     | [输出](app/surge.conf)     | [输出](subconverter/surge.conf)     |
| Surfboard    | `/s/test/converter/surfboard` | [输出](app/surfboard.conf) | [输出](subconverter/surfboard.conf) |
| Loon         | `/s/test/converter/loon`      | [输出](app/loon.conf)      | [输出](subconverter/loon.conf)      |

[差异文档索引](differences/README.md) · [机器可读统计](comparison/results.json)
