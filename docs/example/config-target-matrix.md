# 外部配置项与输出 target 关联

范围：当前 INI 外部配置 `[custom]` 中应用实际读取的全部配置项；不是应用全局设置或 `/sub` 全部请求参数清单。依据 src 实现整理，不依据其他目录示例。

| 配置项                     | 输出 target 关联                                                                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enable_rule_generator`    | clash、clashr、surge、surfboard、stash、mellow、quan、quanx、loon、singbox（完整配置模式）；控制是否生成规则                                            |
| `overwrite_original_rules` | clash、clashr、surge、surfboard、stash、mellow、quan、quanx、loon、singbox（完整配置模式）；规则生成启用时控制模板规则保留/覆盖，具体保留例外随格式变化 |
| `ruleset`                  | clash、clashr、surge、surfboard、stash、mellow、quan、quanx、loon、singbox（完整配置模式）                                                              |
| `surge_ruleset`            | clash、clashr、surge、surfboard、stash、mellow、quan、quanx、loon、singbox（完整配置模式）；ruleset 的兼容别名，同时存在时优先 ruleset                  |
| `custom_proxy_group`       | clash、clashr、surge、surfboard、stash、mellow、quan、quanx、loon、singbox（完整配置模式）；各格式支持的组类型不同，不受 enable_rule_generator 开关控制 |
| `ruleprepend`              | 仅 clash；其他 target 在请求校验阶段报错；不支持 list=true 或 script=true                                                                               |
| `ruleappend`               | 仅 clash；限制同 ruleprepend                                                                                                                            |
| `clash_rule_base`          | clash、clashr；模板加载路径                                                                                                                             |
| `surge_rule_base`          | surge；模板加载路径                                                                                                                                     |
| `surfboard_rule_base`      | surfboard；模板加载路径                                                                                                                                 |
| `mellow_rule_base`         | mellow；模板加载路径                                                                                                                                    |
| `quan_rule_base`           | quan；模板加载路径                                                                                                                                      |
| `quanx_rule_base`          | quanx；模板加载路径                                                                                                                                     |
| `loon_rule_base`           | loon；模板加载路径                                                                                                                                      |
| `sssub_rule_base`          | sssub；模板加载路径                                                                                                                                     |
| `singbox_rule_base`        | singbox；模板加载路径                                                                                                                                   |
| `stash_rule_base`          | stash；模板加载路径                                                                                                                                     |
| `rename`                   | 全部输出 target 的公共节点处理流程；实际效果取决于节点是否匹配，以及目标是否输出对应节点/名称。远程 provider 引用另有专门处理限制                       |
| `add_emoji`                | 全部输出 target 的公共节点处理流程；实际效果取决于节点是否匹配，以及目标是否输出对应节点/名称。远程 provider 引用另有专门处理限制                       |
| `remove_old_emoji`         | 全部输出 target 的公共节点处理流程；实际效果取决于节点是否匹配，以及目标是否输出对应节点/名称。远程 provider 引用另有专门处理限制                       |
| `emoji`                    | 全部输出 target 的公共节点处理流程；实际效果取决于节点是否匹配，以及目标是否输出对应节点/名称。远程 provider 引用另有专门处理限制                       |
| `include_remarks`          | 全部输出 target 的公共节点处理流程；实际效果取决于节点是否匹配，以及目标是否输出对应节点/名称。远程 provider 引用另有专门处理限制                       |
| `exclude_remarks`          | 全部输出 target 的公共节点处理流程；实际效果取决于节点是否匹配，以及目标是否输出对应节点/名称。远程 provider 引用另有专门处理限制                       |

全部 target 指：clash、clashr、surge、surfboard、stash、mellow、sssub、ss、ssr、v2ray、v2rayn、v2rayng、shadowrocket、trojan、vless、hysteria2、mixed、quan、quanx、loon、ssd、singbox。名称使用请求中的 target 值。

## 使用条件与代码依据

- 外部 INI 字段完整读取范围：src/handler/settings.cpp:2303–2379。`[template]` 是独立节，其任意键作为模板局部变量；仅在目标渲染模板且模板实际引用变量时影响输出，不是 `[custom]` 固定配置项。
- target 分派和模板选择：src/handler/interfaces.cpp:6630–7027。
- 规则生成开关和覆盖参数实际消费：src/generator/config/subexport.cpp:2605、4212、5038、6471、7101、7380、7992、8823。Surge 与 Surfboard 共用 proxyToSurge，Clash 与 ClashR 共用 proxyToClash。
- ruleprepend/ruleappend 的入口限制：src/handler/interfaces.cpp:4450–4468。即使其他生成器中存在相关内部代码，也不能据此认定该 target 的公开请求支持。
- 公共节点预处理：src/handler/interfaces.cpp:6394；外部配置到策略参数传递见同文件 4290–4370。过滤/重命名等属于输出前处理，不保证每个目标都会显现名称变化。
- 节点列表模式会跳过部分模板、策略组和规则处理，因此表中规则/策略关联以完整配置输出为前提。
- sssub、ssd、ss、ssr、v2ray、v2rayn、v2rayng、shadowrocket、trojan、vless、hysteria2、mixed 不消费上述两个规则开关来生成分流规则。

## singbox 模板规则的特殊处理

启用生成后，overwrite_original_rules=false 保留全部模板 route.rules 再追加；true 仅保留 action 为 sniff、hijack-dns、resolve、route-options 的模板规则，再追加生成规则。关闭生成则保留模板 route.rules。见 src/generator/config/ruleconvert.cpp:1229–1287。

验证方式：静态追踪配置读取、请求校验、target 分派及生成器消费路径，未执行所有 target 的端到端转换。
