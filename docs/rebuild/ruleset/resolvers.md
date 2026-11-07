# 规则解析器

声明 resolver 分两种。分隔串处理 INI 的逗号和 `[]` 内联标记，结构化 resolver 处理 YAML/TOML 的字段。正文 resolver 由规则类别注册表分派。一份配置可混合类别。现有代码通过来源前缀或 TOML type 逐条选择类别。新入口可提供显式默认类别，有显式条目类别时以条目为准。

| 正文类别        | 识别方式                                       | 现有转换与设计落点                                                                                               |
| --------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Surge           | `surge:` 或 TOML `surge-ruleset`，未声明时默认 | 旧转换原样通过，后续输出解析匹配条件。新正文 resolver 分离规则类型、参数和 flags                                 |
| Quantumult X    | `quanx:` 或 TOML `quantumultx`                 | HOST 系列转 DOMAIN 系列，IP6-CIDR 转 IP-CIDR6。按规则语法去掉原策略，保留支持的 flags                            |
| Clash Domain    | `clash-domain:`                                | 读取 payload，普通域名转 DOMAIN，点前缀及 `+.` 转 DOMAIN-SUFFIX，旧转换对带尾随 `.*` 的后缀形式转 DOMAIN-KEYWORD |
| Clash IP CIDR   | `clash-ipcidr:`                                | 读取 payload，按 IPv4/IPv6 区分 IP-CIDR 与 IP-CIDR6                                                              |
| Clash Classical | `clash-classic:`                               | 读取 payload，再按完整规则行语法处理类型、参数及 flags                                                           |
| 内联            | INI `[]` 或 YAML `rule`                        | 去掉标记，解析一条规则，目标取声明的 group；旧 TOML 绑定要求 ruleset 字段                                        |

旧 [convertRulesetUncached](/Users/larify/Documents/github/SubConverter-Extended/src/generator/config/ruleconvert.cpp:38)按是否存在 payload 识别 Clash 正文，Domain 与 CIDR 路径共享启发式转换。方案按明确类别校验正文，迁移用现有样例记录两者差异。使用能保持引号和逗号语义的分词，尤其是含逗号的规则参数。选项保留 `no-resolve`、`stash_format`（旧选项写法及可接受值按 [ruleset.cpp](/Users/larify/Documents/github/SubConverter-Extended/src/config/ruleset.cpp)），周期默认 86400 秒，按条目语法区分未设置和显式值。目标规则表示、默认规则、是否可输出原生 provider 由目标驱动决定。

若编译需展开资源，调用层用此模块的正文解析接口取得规则项，再按声明关联。验收覆盖三种 Clash payload、IPv4/IPv6、前后注释、内联 MATCH/FINAL、逗号参数和 QuanX 别名；错误格式或类别生成带位置的诊断。
