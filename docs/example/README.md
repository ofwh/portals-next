# 从代码推导的 sing-box 配置

本目录以当前 src 实现为依据，不以 base 或其他目录的示例文件为依据。

- singbox.ini：完整 [custom] 配置，5 个策略组、5 条内联规则。
- singbox.json：完整转换输入模板，包含日志、DNS、mixed 入站、路由、缓存及 Clash API。

## 解析与生成依据

| 内容         | 实现位置                                                        | 推导结果                                                                                                                 |
| ------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 外部配置字段 | src/handler/settings.cpp:2303–2342                              | 在 custom 节读取重复 custom_proxy_group；优先读取 ruleset，否则 surge_ruleset；读取 singbox_rule_base 和两个规则生成开关 |
| 策略语法     | src/config/binding.h:204–270                                    | 反引号分隔名称、类型、节点筛选项；url-test 最后两项为 URL 和时间配置                                                     |
| 内联规则语法 | src/config/ruleset.cpp:132–149                                  | 首个逗号前为策略，后面以 [] 开头时整段作为内联规则保留                                                                   |
| 出站生成     | src/generator/config/subexport.cpp:8156–8797                    | 重建 outbounds，加入 DIRECT、订阅节点和策略；select → selector，url-test → urltest；空组回退 DIRECT                      |
| 测速字段     | src/generator/config/subexport.cpp:8768–8776                    | url-test 输出 url、格式化 interval，正容差才输出 tolerance                                                               |
| 模板加载     | src/generator/config/subexport.cpp:8799–8830                    | 普通完整配置模式解析模板 JSON，生成出站，再按 enable_rule_generator 决定是否生成路由                                     |
| 规则转换     | src/generator/config/ruleconvert.cpp:1029–1181                  | DOMAIN-SUFFIX → domain_suffix，IP-CIDR → ip_cidr；字符串条件输出数组；生成 action=route 和 outbound=策略名               |
| 最终出口     | src/generator/config/ruleconvert.cpp:1038–1052、末尾 route 写回 | 先要求至少两个逗号分隔项，再识别 FINAL/MATCH，最终出口取 ruleset 的策略名                                                |
| 覆盖规则     | src/generator/config/ruleconvert.cpp:1229–1278                  | 覆盖时仍保留 sniff、hijack-dns、resolve、route-options 动作规则                                                          |

## 示例结果

规则依次生成：local.example.com → DIRECT；cn 后缀 → Domestic；192.168.0.0/16 → Domestic；media.example.com → Media；route.final → Final。

必须写 `ruleset=Final,[]FINAL,Final`。第二个 Final 只是满足当前解析器的两项要求，最终出口实际上取前面的策略名。裸 `[]FINAL` 在当前代码会被跳过。

当前规则生成器统一输出 route 动作，不会把 REJECT 特判成 reject；出站生成器也不创建 REJECT，因此本例不使用它。

模板 outbounds 留空，因为转换器会重建。route.final 由 FINAL 规则写入。模板中的 DNS、日志、入站及 experimental 是为构成完整示例而选择的静态配置：生成器保留这些字段，但不会校验它们是否符合某一 sing-box 版本。它们不是从代码唯一推导出的默认值。

## 使用与验证范围

从仓库根目录启动应用，转换请求使用 target=singbox、config=example/singbox.ini，并提供订阅 url。其他运行目录需调整 singbox_rule_base 路径。域名为演示值，可自行替换。

已静态核对上述解析和生成路径，模板通过 JSON 解析。未执行真实订阅转换或 sing-box 启动验证。
