# Loon 生成配置格式审查

现有订阅路由 `/s/test/converter/loon` 返回 HTTP 200，实际使用已发布的规则策略 INI，但工作流未连接模板节点。另用同一工作流编译服务显式传入已发布模板，未保存或修改工作流。相同输入下，无模板编译结果与路由响应逐字节一致。两次编译均输出 191 个 Trojan 节点、7 个远程过滤器、12 个策略组、14 条远程规则及 2 条本地规则。[规则策略 INI](https://p.bofoi.com/b/ruleset/loon) · [模板](https://p.bofoi.com/b/tpl/loon)

## 异常与兼容性待核验项

| 项目            | 生成结果                                                                                                                                                   | 判断                                                                                                                                                                                                              |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 路由未应用模板  | 路由响应缺少 `[General]`、`[Plugin]` 和 `[Mitm]`。显式传入模板后，23 条通用设置、19 条插件条目和 4 条 MITM 设置均保留。插件只发生 `tag` 等号周围的空白变化 | 工作流未传模板。编译器可保留这些段                                                                                                                                                                                |
| 策略组引用缺失  | 9 个策略组引用了未定义的 `香港优选`、`日本优选`、`美国优选`、`新加坡优选`、`台湾优选`、`其他优选`。7 个过滤器中的 `香港节点` 等名称与这些引用不同          | 输入缺失定义，输出保留了这些悬空引用。`自动选择` 的 6 个成员全部无法在配置中解析                                                                                                                                  |
| 测速组嵌套      | `自动选择` 是 `url-test`，6 个成员均为预期的优选策略组                                                                                                     | 即使补齐这 6 个策略组，官方教程也说明 `url-test` 不支持将其他策略组作为测速成员。[官方 URL-Test 文档](https://nsloon.uk/tutorial/advanced/URL-Test.html)                                                          |
| 策略组循环引用  | `代理访问 → 直连访问 → 代理访问`                                                                                                                           | 输入中的循环原样输出。客户端选择循环分支时的表现未验证                                                                                                                                                            |
| 远程过滤器来源  | 7 条均输出为 `名称 = NameKeyword 或 NameRegex, FilterKey = …`，正则和关键词与输入一致，但缺少订阅别名。带模板输出中的 `[Remote Proxy]` 也为空              | 官方示例在过滤器类型后指定订阅别名。本次配置的 191 个节点位于 `[Proxy]`，需确认客户端是否会将它们纳入这些过滤器。[官方配置示例](https://github.com/Loon0x00/LoonExampleConfig/blob/master/example.conf#L582-L595) |
| Trojan TLS 字段 | 191 个节点均输出 `sni=`，官方节点手册使用 `tls-name=`                                                                                                      | 字段名存在差异。当前客户端是否接受 `sni` 别名未验证。[官方节点手册](https://github.com/Loon0x00/LoonManual/blob/master/docs/cn/node.md)                                                                           |
| 模板证书        | 发布模板含非空 `ca-p12` 和 `ca-passphrase`，带模板编译原样保留两项                                                                                         | 模板公开分发证书材料及其口令。若 PKCS#12 含私钥，应视为该私钥已公开。报告省略其内容                                                                                                                               |

## 已核对的输出

- **远程规则**：14 条 URL、策略和顺序与规则 INI 完全一致。生成的 `URL, policy=…, enabled=true` 与官方示例一致。发布的规则 INI 未声明 `tag`，官方示例中的远程规则也未使用该字段。[官方配置示例](https://github.com/Loon0x00/LoonExampleConfig/blob/master/example.conf#L642-L650)
- **本地规则**：输出 `GEOIP,cn,直连访问`、`FINAL,代理访问`，策略均有定义。官方示例使用大写 `CN`，小写兼容性未在客户端验证。[官方配置示例](https://github.com/Loon0x00/LoonExampleConfig/blob/master/example.conf#L625-L640)
- **策略组字段**：12 个 `img-url` 均已输出为独立参数，`ssid` 保留 `default`、`cellular` 和带引号的 Wi-Fi 名称，测速组保留 `url`、`interval=30`、`tolerance=50`。[官方 SSID 示例](https://github.com/Loon0x00/LoonExampleConfig/blob/master/example.conf#L597-L615) · [官方策略组手册](https://github.com/Loon0x00/LoonManual/blob/master/docs/cn/policygroup.md)

核验范围为生成文本和配置引用，未在 Loon 客户端导入，也未请求远程规则或插件正文。
