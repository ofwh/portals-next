# 分组解析器

旧代码以格式适配接入条目语法，组类别由条目自己的 type 决定。新入口显式选择 `legacy-delimited` 或 `legacy-object`，两者接入同一组类别注册表。一份配置可以混合多个组类别。

| 条目 resolver    | 解析方法                                                                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| legacy-delimited | 分割 name、type、成员条目；测试型组尾部为 url 与 interval,timeout,tolerance。将 `!!PROVIDER=` 转为 provider 引用列表                                       |
| legacy-object    | 读取 name、type、rule、url 和测试选项。TOML 还读取 use、strategy 及适用的布尔字段。YAML 旧路径先转成分隔串，应以兼容样例确认默认值与 relay/ssid 的尾部行为 |

| 组类别       | 归一化处理                                                               |
| ------------ | ------------------------------------------------------------------------ |
| select       | 成员选择器；兼容旧语法末尾 HTTP(S) 健康检查 URL                          |
| url-test     | URL、周期、超时、容差；保留 lazy、evaluate-before-use                    |
| fallback     | URL、周期、超时；保留 evaluate-before-use                                |
| load-balance | URL、周期、超时、策略 consistent-hashing 或 round-robin；保留 persistent |
| relay        | 保留成员声明顺序                                                         |
| ssid         | 保留 SSID 所需的有序条目，目标驱动负责转成客户端语法                     |
| smart        | URL、周期、超时、容差及可选 lazy、evaluate-before-use                    |

公共字段为 name、kind、selectors、providerRefs、可选 healthCheck、disableUdp。成员选择器覆盖普通名称正则、`[]` 显式引用、`!!GROUP=`、`!!GROUPID=`、`!!INSERT=`、`!!TYPE=`、`!!PORT=`、`!!SERVER=`，以及尾部名称正则。若保留 `script:`，解析器生成脚本选择器描述，调用层注入获准的执行能力。求值语义以 [applyMatcher/groupGenerate](/Users/larify/Documents/github/SubConverter-Extended/src/generator/config/subexport.cpp:1354) 为基线。

[INI 绑定](/Users/larify/Documents/github/SubConverter-Extended/src/config/binding.h:202)过滤未知类别与缺项；[TOML 绑定](/Users/larify/Documents/github/SubConverter-Extended/src/config/binding.h:38)校验必填项，并允许仅声明 use。旧 YAML 通过 [readGroup](/Users/larify/Documents/github/SubConverter-Extended/src/handler/settings.cpp:806)设置缺省探测 URL 和 300 秒周期，再走 INI 绑定。新 resolver 保留按语法配置的默认值并记录错误位置。验收覆盖七个类别、来源选择器、重复 INI 项、TOML 仅 provider、未设置与显式 false、导入条目及 YAML 旧默认值。
