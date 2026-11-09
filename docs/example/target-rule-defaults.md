# 各 target 的规则开关默认行为

口径：加载外部 INI 配置成功，省略这两个 [custom] 字段，完整配置模式。ExternalConfig 默认 enable_rule_generator=true、overwrite_original_rules=false（src/handler/settings.h:172–173），加载后传给生成参数（src/handler/interfaces.cpp:4339–4342）。

| target 输出类型 | enable_rule_generator            | overwrite_original_rules                                                        |
| --------------- | -------------------------------- | ------------------------------------------------------------------------------- |
| clash           | 默认 true：启用 ruleset 规则生成 | 默认 false：保留模板 rules / Rule，再追加生成规则                               |
| clashr          | 默认 true：启用 ruleset 规则生成 | 默认 false：保留模板 rules / Rule，再追加生成规则                               |
| surge           | 默认 true：启用 ruleset 规则生成 | 默认 false：保留模板 [Rule]，再追加生成规则                                     |
| surfboard       | 默认 true：启用 ruleset 规则生成 | 默认 false：保留模板 [Rule]，再追加生成规则                                     |
| stash           | 默认 true：启用规则生成          | 默认 false：保留模板规则；从首条 MATCH/FINAL 开始的模板尾部规则移到生成规则之后 |
| mellow          | 默认 true：启用 ruleset 规则生成 | 默认 false：保留模板 [RoutingRule]，再追加生成规则                              |
| quan            | 默认 true：启用 ruleset 规则生成 | 默认 false：保留模板 [TCP]，再追加生成规则                                      |
| quanx           | 默认 true：启用 ruleset 规则生成 | 默认 false：保留模板 [filter_local]，同时保留 [filter_remote]，再追加生成规则   |
| loon            | 默认 true：启用 ruleset 规则生成 | 默认 false：保留模板 [Rule]，同时保留 [Remote Rule]，再追加生成规则             |
| singbox         | 默认 true：启用 ruleset 规则生成 | 默认 false：保留模板 route.rules，再追加生成规则                                |
| sssub           | 不消费此开关，不生成分流规则     | 不消费此开关，不执行模板分流规则覆盖                                            |
| ssd             | 不消费此开关，不生成分流规则     | 不消费此开关，不执行模板分流规则覆盖                                            |
| ss              | 不消费此开关，不生成分流规则     | 不消费此开关，不执行模板分流规则覆盖                                            |
| ssr             | 不消费此开关，不生成分流规则     | 不消费此开关，不执行模板分流规则覆盖                                            |
| v2ray           | 不消费此开关，不生成分流规则     | 不消费此开关，不执行模板分流规则覆盖                                            |
| v2rayn          | 不消费此开关，不生成分流规则     | 不消费此开关，不执行模板分流规则覆盖                                            |
| v2rayng         | 不消费此开关，不生成分流规则     | 不消费此开关，不执行模板分流规则覆盖                                            |
| shadowrocket    | 不消费此开关，不生成分流规则     | 不消费此开关，不执行模板分流规则覆盖                                            |
| trojan          | 不消费此开关，不生成分流规则     | 不消费此开关，不执行模板分流规则覆盖                                            |
| vless           | 不消费此开关，不生成分流规则     | 不消费此开关，不执行模板分流规则覆盖                                            |
| hysteria2       | 不消费此开关，不生成分流规则     | 不消费此开关，不执行模板分流规则覆盖                                            |
| mixed           | 不消费此开关，不生成分流规则     | 不消费此开关，不执行模板分流规则覆盖                                            |

没有应用外部配置时，生成参数继承全局 Settings；其代码初始值是 true / true（src/handler/settings.h:55–56，interfaces.cpp:4136–4137），实际还可被主配置文件改变。因此不存在脱离配置加载路径的唯一默认值。此时支持规则生成的 target 默认覆盖模板规则；singbox 仍保留 sniff、hijack-dns、resolve、route-options 动作规则；quanx 还清除 filter_remote，loon 还清除 Remote Rule。

当前 example/singbox.ini 显式设置 true / true，属于覆盖行为，不采用外部配置字段省略时的 true / false。

规则生成依据：src/generator/config/subexport.cpp 各目标的 enable_rule_generator 分支；规则合并依据：src/generator/config/ruleconvert.cpp:436、621、696、770、1240。Clash 的 provider/script 分支另由 renderClashScript 处理；上述表格描述普通规则配置输出。节点列表模式会跳过相关规则处理。未进行所有 target 的端到端验证。
