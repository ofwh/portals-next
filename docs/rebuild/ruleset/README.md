# 策略配置

输入为配置文本、`format` 和 `resolver`，输出为有序的 `RuleSet[]`。

| 格式 | 字段                          | 条目                                                     |
| ---- | ----------------------------- | -------------------------------------------------------- |
| INI  | `[custom]` 下重复的 `ruleset` | group,source[,interval]，带可选管道分隔选项              |
| YAML | `custom.rulesets`             | 对象序列，读取 group、ruleset 或 rule、interval、options |
| TOML | 根级 `[[rulesets]]`           | 表数组，读取 group、type、ruleset、interval、options     |

旧 YAML/INI 还接受 `surge_ruleset`，新入口按表中的字段提取。旧例中有 `!!import:` 和 `import`，在提取后按条目报禁止导入。规则声明中的远程规则地址是规则来源，保留其数据；解析过程无 I/O。兼容旧本地规则路径时，由调用层按自身资源策略提供内容。

resolver 将条目拆为目标组、来源、正文语法、周期和选项。来源区分单条内联规则与资源引用。规则语法见[规则解析器](resolvers.md)。`enable_rule_generator`、`overwrite_original_rules`、Clash 的 `ruleprepend/ruleappend` 是编译或资源配置，由调用层传入对应阶段。

现有声明解析见 [settings.cpp](/Users/larify/Documents/github/SubConverter-Extended/src/handler/settings.cpp:852)、[binding.h](/Users/larify/Documents/github/SubConverter-Extended/src/config/binding.h:117)和 [ruleset.cpp](/Users/larify/Documents/github/SubConverter-Extended/src/config/ruleset.cpp)。验收覆盖声明顺序、重复条目、默认周期、带选项的周期、内联规则、错误选项、格式与 resolver 不匹配，以及禁止导入。
