# 命名参数配置

## 配置支持的配置项

配置由 `proxy_group`、`ruleset`、`custom` 三类声明组成。每行声明一个配置项，各类声明的字段组成由对应规则定义。具名参数使用 `字段=值`，保持字段名称、大小写、值域和单位；位置值与无值标记保留其原有形式，不为其增加字段别名。

声明不设置顶层分组，也不配置 section 参数。普通代理节点由 `ProxyNode[]` 提供。数组、对象使用 JSON 值；包含分隔符的字符串整体加引号。解析时保留引号、数组和对象内部的分隔符。重复声明、成员、规则和网络条件的顺序均保留。

通用解析仅提取结构字段和参数值：`proxy_group`、`ruleset` 返回 `name`、`kind`、`parameters`，`custom` 返回 `kind`、`parameters`。目标相关的字段校验、模式映射与引用解析由对应编译器消费，不在通用解析层处理。输出类型专属的节点校验、集合选择、模板合并策略与文档组装由 provider 提供，shared 不按具体输出类型分支。 `compile` 仅按目标选择 provider，其 `assemble` 统一消费节点、配置和模板并返回最终编译结果。

字段引用与转义由各输出编译器按目标语法选择，通用组装不统一添加双引号。Clash 规则内部字段保留原始值，YAML 层的转义由 YAML 序列化处理。

参数表中的“未注明”表示官方资料未给出默认值或必需性，“—”表示无固定值。布尔字段填写 true / false；未设置的可选参数保持省略。参数的必需性与生效条件由具体配置项定义。

### proxy_group

用于定义节点分组及其选择方式、成员来源和分组参数。

编译时，成员项中与分组名、已输出节点名、内置策略或 Loon Remote Filter 名称相同的值保留为引用；其余值按 JavaScript 正则匹配当前目标实际输出的节点名称，并在原位置展开为匹配节点列表。未匹配到节点的正则项移除，非法正则导致编译失败。成员顺序和重复项保留。成员统一使用位置值，不接受 proxies 或 outbounds 具名参数；ssid / subnet 的网络条件与其他具名参数不参与匹配。

格式为 ``proxy_group=<名称>`<模式>`<位置值、标记或字段=值>...``，等号后的字段使用反引号分隔。

| 字段位置   | 组成                   | 作用                         | 规则                         |
| ---------- | ---------------------- | ---------------------------- | ---------------------------- |
| 第一字段   | 名称                   | 标识分组并供其他声明引用     | 必填                         |
| 第二字段   | 模式                   | 指定分组的选择方式           | 必填，直接填写模式值         |
| 第三字段起 | 位置值、标记或具名参数 | 指定成员、来源及其他分组属性 | 按对应参数类型填写，保留顺序 |

### ruleset

用于定义规则、规则集合资源及其出口绑定。具体声明是否包含匹配条件、资源信息或出口，按对应配置项的作用域确定。

格式为 `ruleset=<出口或资源标识>,<KIND>,<位置值、标记或字段=值>...`，等号后的字段使用逗号分隔。

| 字段位置   | 组成                   | 作用                                   | 规则                                                 |
| ---------- | ---------------------- | -------------------------------------- | ---------------------------------------------------- |
| 第一字段   | 出口或资源标识         | 指定规则使用的出口节点、策略或资源标签 | 含义和必需性由具体配置项规定；允许为空时保留字段位置 |
| 第二字段   | KIND                   | 指定规则或资源声明的类别               | 必填，统一大写                                       |
| 第三字段起 | 位置值、标记或具名参数 | 指定匹配条件、资源内容及其他规则属性   | 按类别要求填写；无需其他参数时可省略                 |

具名出口字段存在时，其值须与声明出口一致。资源定义与匹配引用按各自作用域配置，不因名称相近而合并。

### custom

用于保存独立配套配置，以及未归入 `proxy_group`、`ruleset` 的配置内容。

格式为 `custom=<模式或动作>,<字段=值>...`，等号后的字段使用逗号分隔。第一字段之后的每一项均为具名参数。

| 字段位置   | 组成       | 作用                   | 规则                                         |
| ---------- | ---------- | ---------------------- | -------------------------------------------- |
| 第一字段   | 模式或动作 | 指定目标配置的处理方式 | 按具体配置项规定填写                         |
| 第二字段起 | 字段=值    | 保存配置参数           | 全部使用具名参数；数组和嵌套对象保持原有结构 |

## 按输出类型配置

以下示例以对应官方文档及配置示例的原生结构展示目标输出片段。片段按目标语法保留节名称、字段层级和规则顺序；普通代理节点、其他已引用资源及无关配置由完整配置提供。各片段合并到同一目标配置的相应位置。

### Surge

#### proxy_group

| 支持的模式                                                                  | 参考文档                                                                        |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `select`、`url-test`、`fallback`、`load-balance`、`smart`、`subnet`、`ssid` | [Policy Group Overview](https://manual.nssurge.com/policy-groups/overview.html) |

参考：[通用参数](https://manual.nssurge.com/policy-groups/parameters.html)、[成员来源](https://manual.nssurge.com/policy-groups/policy-including.html)、[测速](https://manual.nssurge.com/policy-groups/url-test.html)、[Fallback](https://manual.nssurge.com/policy-groups/fallback.html)、[负载均衡](https://manual.nssurge.com/policy-groups/load-balance.html)、[Smart](https://manual.nssurge.com/policy-groups/smart.html)、[Subnet](https://manual.nssurge.com/policy-groups/subnet.html)。

| 字段 / 位置值                                                                  | 类型                   | 作用                     | 默认值       | 必需性                 | 生效条件                                                                      |
| ------------------------------------------------------------------------------ | ---------------------- | ------------------------ | ------------ | ---------------------- | ----------------------------------------------------------------------------- |
| 成员（位置值）                                                                 | 有序名称列表           | 显式成员                 | —            | 与动态来源共同提供成员 | select / url-test / fallback / load-balance；smart 的成员仅为代理节点         |
| `icon-url`                                                                     | URL                    | 分组图标                 | —            | 可选                   | Mac 6.5.0+；全部模式                                                          |
| `hidden`                                                                       | 布尔                   | 隐藏分组                 | false        | 可选                   | 全部模式                                                                      |
| `category`                                                                     | 字符串                 | 展示分类                 | —            | 可选                   | iOS 5.23.0+ / Mac 6.10.0+；全部模式                                           |
| `no-alert`                                                                     | 布尔                   | 关闭策略切换通知         | false        | 可选                   | url-test / fallback                                                           |
| `underlying-proxy`                                                             | 策略名                 | 为成员代理指定上游       | —            | 可选                   | iOS 5.22.0+ / Mac 6.9.0+；select / url-test / fallback / load-balance / smart |
| `policy-path`                                                                  | 路径或 URL             | 外部节点来源             | —            | 可选                   | select / url-test / fallback / load-balance / smart                           |
| `update-interval`                                                              | 秒                     | 外部来源更新周期         | 86400        | 可选                   | policy-path 为远程 URL                                                        |
| `policy-regex-filter`                                                          | 正则                   | 按名称过滤动态来源       | 不过滤       | 可选                   | 作用于 policy-path、include-all-proxies、include-other-group                  |
| `include-all-proxies`                                                          | 布尔                   | 引入全部代理节点         | false        | 可选                   | select / url-test / fallback / load-balance / smart                           |
| `include-other-group`                                                          | 逗号分隔的组名字符串   | 引入其他组的成员         | —            | 可选                   | select / url-test / fallback / load-balance / smart；多个组名整体加引号       |
| `external-policy-name-prefix`                                                  | 字符串                 | 为外部节点增加前缀       | —            | 可选                   | policy-path；值中不能包含等号                                                 |
| `external-policy-modifier`                                                     | 带引号的参数列表       | 覆盖外部节点字段         | —            | 可选                   | 仅作用于 policy-path 引入的节点                                               |
| `interval`                                                                     | 秒                     | 测试结果有效期           | 600          | 可选                   | url-test / fallback / load-balance                                            |
| `tolerance`                                                                    | 毫秒                   | 切换容差                 | 100          | 可选                   | url-test；0 表示每次选择最快者                                                |
| `timeout`                                                                      | 秒                     | 按测试延迟筛选候选节点   | 不按延迟筛选 | 可选                   | url-test / fallback / load-balance；与探测连接超时分别设置                    |
| `evaluate-before-use`                                                          | 布尔                   | 首次使用前等待测试结果   | false        | 可选                   | url-test / fallback / load-balance / smart                                    |
| `persistent`                                                                   | 布尔                   | 相同目标主机使用相同节点 | false        | 可选                   | load-balance                                                                  |
| `policy-priority`                                                              | 带引号的正则与倍率列表 | 调整评分倍率             | 1.0          | 可选                   | smart；倍率为正数，按首个匹配项应用                                           |
| `default`                                                                      | 策略名                 | 无网络条件命中时的策略   | —            | 必填                   | subnet / ssid                                                                 |
| `SSID:<名称>`、`BSSID:<地址>`、`ROUTER:<IP>`、`TYPE:<类型>`、`MCCMNC:<运营商>` | 条件键与策略名         | 按当前网络选择策略       | —            | 可选                   | subnet / ssid；按声明顺序首个命中；MCCMNC 仅在未连接 Wi-Fi 时匹配             |

动态成员按显式成员、include-other-group、include-all-proxies、policy-path 的顺序合并，重名保留首项。smart 以 5 分钟为固定测试周期。subnet / ssid 的展示字段使用 hidden、icon-url、category；网络条件按首个命中项决定策略，再回退到 default。

声明示例：

```ini
proxy_group=代理访问`select`香港节点`DIRECT`icon-url=https://example.com/proxy.png
```

目标输出示例：

```ini
[Proxy Group]
代理访问 = select,香港节点,DIRECT,icon-url=https://example.com/proxy.png
```

#### ruleset

| 支持的 kind                                                                                                                                                                                                                                            | 适用说明                                                                                                                                                 | 参考文档                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `DOMAIN`、`DOMAIN-SUFFIX`、`DOMAIN-KEYWORD`、`DOMAIN-WILDCARD`、`DOMAIN-SET`、`IP-CIDR`、`IP-CIDR6`、`GEOIP`、`IP-ASN`、`SUBNET`、`RULE-SET`、`USER-AGENT`、`URL-REGEX`、`PROCESS-NAME`、`IN-PORT`、`DEST-PORT`、`SRC-IP`、`AND`、`OR`、`NOT`、`FINAL` | `PROCESS-NAME` 用于 macOS。`SUBNET` 匹配网络条件。`RULE-SET`、`DOMAIN-SET` 的位置值引用对应集合。逻辑条件使用 AND、OR、NOT；`FINAL` 无匹配值，位于末尾。 | [规则](https://manual.nssurge.com/rules/overview.html)、[规则集](https://manual.nssurge.com/rules/ruleset.html) |

参考：[规则参数](https://manual.nssurge.com/rules/overview.html)、[集合](https://manual.nssurge.com/rules/ruleset.html)、[域名集合](https://manual.nssurge.com/rules/domain.html)。

| 字段 / 位置值           | 类型               | 作用                                     | 默认值 | 必需性         | 生效条件                                                                                         |
| ----------------------- | ------------------ | ---------------------------------------- | ------ | -------------- | ------------------------------------------------------------------------------------------------ |
| 匹配值（位置值）        | 字符串或逻辑表达式 | 对应 kind 的原生匹配条件                 | —      | FINAL 之外必填 | 集合可使用 URL、本地路径、内联集合名或目标支持的内置集合名；逻辑规则使用原生括号表达式           |
| `update-interval`       | 秒                 | 集合自动更新周期                         | 86400  | 可选           | 远程 RULE-SET / DOMAIN-SET；负数关闭自动更新                                                     |
| `no-resolve`            | 无值标记           | 不为 IP 条件主动发起 DNS 解析            | 不启用 | 可选           | IP-CIDR / IP-CIDR6 / GEOIP / IP-ASN / RULE-SET / DOMAIN-SET                                      |
| `extended-matching`     | 无值标记           | 扩展匹配条件检查                         | 不启用 | 可选           | DOMAIN / DOMAIN-SUFFIX / DOMAIN-KEYWORD / DOMAIN-WILDCARD / URL-REGEX / RULE-SET / DOMAIN-SET    |
| `pre-matching`          | 无值标记           | 在 DNS 解析前预匹配并拒绝                | 不启用 | 可选           | 顶层规则且出口为 REJECT 系列；域名、IP、源地址与端口、SUBNET、逻辑及集合规则；规则集文件内不使用 |
| `dns-failed`            | 无值标记           | DNS 失败时仍使用兜底策略                 | 不启用 | 可选           | FINAL                                                                                            |
| `always-capture`        | 会话名称           | 强制捕获匹配的 HTTP 流量并记录到指定会话 | —      | 可选           | 包括 FINAL 在内的规则                                                                            |
| `notification-text`     | 字符串             | 命中规则时发送通知                       | —      | 可选           | 所有规则                                                                                         |
| `notification-interval` | 秒                 | 相同规则通知的最小间隔                   | 300    | 可选           | 所有规则；与 notification-text 配合使用                                                          |

RULE-SET 文件中的规则继承集合声明的出口，文件内不包含策略列、FINAL 或 pre-matching。通知字段按规则配置。

声明示例：

```ini
ruleset=代理访问,RULE-SET,https://example.com/proxy.list,update-interval=86400
ruleset=DIRECT,GEOIP,CN,no-resolve
ruleset=代理访问,FINAL
```

目标输出示例：

```ini
[Rule]
RULE-SET,https://example.com/proxy.list,代理访问,update-interval=86400
GEOIP,CN,DIRECT,no-resolve
FINAL,代理访问
```

### Surfboard

#### proxy_group

| 支持的模式                                                                  | 参考文档                                                                                      |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `select`、`url-test`、`fallback`、`load-balance`、`subnet`、`ssid`、`smart` | [Profile Syntax Reference](https://getsurfboard.com/zh-Hans/docs/ai-profile-guide/reference/) |

参考：[参数参考](https://getsurfboard.com/docs/ai-profile-guide/reference/)。

| 字段 / 位置值                                                                  | 类型                 | 作用                     | 默认值 | 必需性                 | 生效条件                                                |
| ------------------------------------------------------------------------------ | -------------------- | ------------------------ | ------ | ---------------------- | ------------------------------------------------------- |
| 成员（位置值）                                                                 | 有序名称列表         | 显式成员                 | —      | 与动态来源共同提供成员 | select / url-test / smart / fallback / load-balance     |
| `hidden`                                                                       | 布尔                 | 隐藏分组                 | false  | 可选                   | 分组展示                                                |
| `no-alert`                                                                     | 布尔                 | 关闭通知                 | false  | 可选                   | 分组通知                                                |
| `policy-path`                                                                  | URL                  | 外部节点来源             | —      | 可选                   | 动态成员来源                                            |
| `policy-regex-filter`                                                          | 正则                 | 筛选动态成员             | .*     | 可选                   | policy-path / include-all-proxies / include-other-group |
| `update-interval`                                                              | 秒                   | 来源更新周期             | 86400  | 可选                   | policy-path；有效最小值 900；更新在下次 VPN 启动时应用  |
| `include-all-proxies`                                                          | 布尔                 | 引入全部代理节点         | false  | 可选                   | 动态成员来源                                            |
| `include-other-group`                                                          | 逗号分隔的组名字符串 | 引入其他组成员           | —      | 可选                   | 多个组名整体加引号                                      |
| `url`                                                                          | HTTP URL             | 测试地址                 | 未注明 | 适用模式需提供         | url-test / smart / fallback；使用 http://               |
| `interval`                                                                     | 秒                   | 测试周期                 | 600    | 可选                   | url-test / smart / fallback                             |
| `timeout`                                                                      | 秒                   | 测试超时                 | 5      | 可选                   | url-test / smart / fallback                             |
| `tolerance`                                                                    | 毫秒                 | 切换容差                 | 100    | 可选                   | url-test / smart                                        |
| `persistent`                                                                   | 布尔                 | 固定目标与节点的对应关系 | false  | 可选                   | load-balance                                            |
| `default`                                                                      | 策略名               | 默认策略                 | —      | 必填                   | subnet / ssid                                           |
| `SSID:<名称>`、`BSSID:<地址>`、`ROUTER:<IP>`、`TYPE:<类型>`、`MCCMNC:<运营商>` | 条件键与策略名       | 网络条件选择             | —      | 可选                   | subnet / ssid；SSID / BSSID 条件需要位置权限            |

声明示例：

```ini
proxy_group=代理访问`select`香港节点`DIRECT
```

目标输出示例：

```ini
[Proxy Group]
代理访问 = select,香港节点,DIRECT
```

#### ruleset

| 支持的 kind                                                                                                                                                                                                                                             | 适用说明                                                                                                                                             | 参考文档                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `DOMAIN`、`DOMAIN-SUFFIX`、`DOMAIN-KEYWORD`、`DOMAIN-WILDCARD`、`DOMAIN-SET`、`IP-CIDR`、`IP-CIDR6`、`GEOIP`、`SUBNET`、`RULE-SET`、`PROCESS-NAME`、`USER-AGENT`、`IN-PORT`、`DEST-PORT`、`SRC-IP`、`SRC-PORT`、`PROTOCOL`、`AND`、`OR`、`NOT`、`FINAL` | `PROCESS-NAME` 匹配 Android 包名；`SRC-IP`、`IN-PORT` 用于 LAN 代理流量。`SUBNET` 匹配网络条件。集合的位置值为远程 URL；`FINAL` 无匹配值，位于末尾。 | [Rule 参数](https://getsurfboard.com/docs/ai-profile-guide/reference/#rule) |

参考：[Rule 参数](https://getsurfboard.com/docs/ai-profile-guide/reference/#rule)、[规则集合](https://getsurfboard.com/docs/profile-format/rule/ruleset/)。

| 字段 / 位置值      | 类型               | 作用                     | 默认值 | 必需性         | 生效条件                                                                              |
| ------------------ | ------------------ | ------------------------ | ------ | -------------- | ------------------------------------------------------------------------------------- |
| 匹配值（位置值）   | 字符串或逻辑表达式 | 对应 kind 的原生条件     | —      | FINAL 之外必填 | RULE-SET / DOMAIN-SET 使用远程 URL；SUBNET 的 SSID / BSSID 条件需要位置权限           |
| `update-interval`  | 秒                 | 远程集合后台刷新周期     | 未注明 | 可选           | RULE-SET / DOMAIN-SET；有效最小值 900；下次 VPN 启动时应用                            |
| `no-resolve`       | 无值标记           | 不为 IP 匹配主动解析 DNS | 不启用 | 可选           | IP-CIDR / IP-CIDR6 / GEOIP                                                            |
| `force-remote-dns` | 无值标记           | 经代理解析域名           | 不启用 | 可选           | DOMAIN / DOMAIN-SUFFIX / DOMAIN-KEYWORD / DOMAIN-WILDCARD / PROCESS-NAME / USER-AGENT |
| `enhanced-mode`    | 无值标记           | 启用增强匹配             | 不启用 | 可选           | DOMAIN / DOMAIN-SUFFIX / DOMAIN-KEYWORD / DOMAIN-WILDCARD / PROCESS-NAME / USER-AGENT |

AND / OR 至少包含两个子条件，NOT 仅含一个；逻辑嵌套最多 16 层，内部不使用 RULE-SET / DOMAIN-SET。远程 RULE-SET 的条目不含策略列，且不嵌套 RULE-SET。FINAL 放在最后。

声明示例：

```ini
ruleset=代理访问,RULE-SET,https://example.com/proxy.list,update-interval=86400
ruleset=DIRECT,GEOIP,CN,no-resolve
ruleset=代理访问,FINAL
```

目标输出示例：

```ini
[Rule]
RULE-SET,https://example.com/proxy.list,代理访问,update-interval=86400
GEOIP,CN,DIRECT,no-resolve
FINAL,代理访问
```

### Loon

#### proxy_group

| 支持的模式                                               | 参考文档                                                                                                                                  |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `select`、`url-test`、`fallback`、`load-balance`、`ssid` | [策略组](https://nsloon.app/docs/Policy/policygroup/)、[配置示例](https://github.com/Loon0x00/LoonExampleConfig/blob/master/example.conf) |

参考：[策略组](https://nsloon.app/docs/Policy/policygroup/)、[官方示例](https://github.com/Loon0x00/LoonExampleConfig/blob/master/example.conf)。

| 字段 / 位置值  | 类型           | 作用                       | 默认值                                          | 必需性     | 生效条件                                                                                  |
| -------------- | -------------- | -------------------------- | ----------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------- |
| 成员（位置值） | 有序名称列表   | 节点、分组或订阅成员       | —                                               | 需提供成员 | select / url-test / fallback / load-balance；url-test / fallback 使用单节点或远端订阅节点 |
| `img-url`      | URL            | 分组图标                   | 未注明                                          | 可选       | 分组展示                                                                                  |
| `url`          | URL            | 测试地址                   | 未注明                                          | 未注明     | url-test / fallback / load-balance                                                        |
| `interval`     | 秒             | 测试周期                   | url-test / fallback 为 600；load-balance 未注明 | 可选       | url-test / fallback / load-balance                                                        |
| `tolerance`    | 毫秒           | 切换容差                   | 未注明                                          | 可选       | url-test                                                                                  |
| `max-timeout`  | 毫秒           | 筛除测试时间超过阈值的节点 | 未注明                                          | 可选       | fallback / load-balance                                                                   |
| `algorithm`    | 枚举           | 负载均衡算法               | 未注明                                          | 未注明     | load-balance；Random / PCC / Round-Robin                                                  |
| `default`      | 策略名         | 默认网络策略               | 未注明                                          | 配置时提供 | ssid                                                                                      |
| `cellular`     | 策略名         | 蜂窝网络策略               | 未注明                                          | 未注明     | ssid；当前使用蜂窝网络时                                                                  |
| `"<SSID>"`     | 条件键与策略名 | 指定 Wi-Fi 的策略          | —                                               | 可选       | ssid；当前网络名称匹配时                                                                  |

声明示例：

```ini
proxy_group=代理访问`select`香港节点`直连访问`img-url=https://example.com/proxy.png
proxy_group=直连访问`select`DIRECT
proxy_group=自动选择`url-test`香港节点`url=http://www.gstatic.com/generate_204`interval=30`tolerance=50
proxy_group=场景切换`ssid`default=代理访问`cellular=代理访问`"1304"=直连访问
```

目标输出示例：

```ini
[Proxy Group]
代理访问 = select,香港节点,直连访问,img-url=https://example.com/proxy.png
直连访问 = select,DIRECT
自动选择 = url-test,香港节点,url=http://www.gstatic.com/generate_204,interval=30,tolerance=50
场景切换 = ssid,default=代理访问,cellular=代理访问,"1304"=直连访问
```

#### ruleset

| 支持的 kind                                                                                                                                                                                                                       | 适用说明                                                                                                                                                      | 参考文档                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DOMAIN`、`DOMAIN-SUFFIX`、`DOMAIN-KEYWORD`、`DOMAIN-WILDCARD`、`IP-CIDR`、`IP-CIDR6`、`GEOIP`、`IP-ASN`、`RULE-SET`、`USER-AGENT`、`URL-REGEX`、`PROCESS-NAME`、`DEST-PORT`、`SRC-PORT`、`PROTOCOL`、`AND`、`OR`、`NOT`、`FINAL` | `DOMAIN-WILDCARD` 用于 build 1008+；端口、协议和逻辑规则用于 3.1.7+；`PROCESS-NAME` 用于 macOS。`RULE-SET` 表示 Remote Rule，位置值为 URL；`FINAL` 无匹配值。 | [域名](https://nsloon.app/docs/Rule/domain_rule/)、[IP](https://nsloon.app/docs/Rule/ip_rule/)、[订阅规则](https://nsloon.app/docs/Rule/sub_rule/)、[HTTP](https://nsloon.app/docs/Rule/http_rule/)、[端口](https://nsloon.app/docs/Rule/port_rule/)、[协议](https://nsloon.app/docs/Rule/protocol_rule/)、[进程](https://nsloon.app/docs/Rule/process_rule/)、[逻辑](https://nsloon.app/docs/Rule/logic_rule/) |

参考：[本地规则](https://nsloon.app/docs/Rule/ip_rule/)、[订阅规则](https://nsloon.app/docs/Rule/sub_rule/)、[官方示例](https://github.com/Loon0x00/LoonExampleConfig/blob/master/example.conf)。

| 字段 / 位置值              | 类型               | 作用                           | 默认值 | 必需性             | 生效条件                                           |
| -------------------------- | ------------------ | ------------------------------ | ------ | ------------------ | -------------------------------------------------- |
| 匹配值或资源地址（位置值） | 字符串或逻辑表达式 | 本地规则条件或 Remote Rule URL | —      | FINAL 之外必填     | 本地规则使用原生匹配值；RULE-SET 使用订阅 URL      |
| 出口（第一字段）           | 策略名             | 生成远程规则的 policy          | 未注明 | 按策略覆盖需求填写 | Remote Rule；policy 由第一字段唯一提供；为空时省略 |
| `enabled`                  | 布尔               | 启用远程规则                   | 未注明 | 可选               | Remote Rule                                        |
| `no-resolve`               | 无值标记           | 不为 IP 条件主动解析 DNS       | 不启用 | 可选               | 本地 IP-CIDR / IP-CIDR6 / GEOIP / IP-ASN           |

本地规则使用位置匹配值。Remote Rule 的 policy 由声明第一字段提供，enabled 保留为具名参数。逻辑条件使用原生括号表达式，NOT 仅含一个子条件。

声明示例：

```ini
ruleset=代理访问,RULE-SET,https://example.com/proxy.lsr,enabled=true
ruleset=直连访问,GEOIP,CN,no-resolve
ruleset=代理访问,FINAL
```

目标输出示例：

```ini
[Remote Rule]
https://example.com/proxy.lsr,policy=代理访问,enabled=true

[Rule]
GEOIP,CN,直连访问,no-resolve
FINAL,代理访问
```

#### custom

| 配置项          | 筛选模式                     | 作用                     | 引用方式                      |
| --------------- | ---------------------------- | ------------------------ | ----------------------------- |
| `REMOTE_FILTER` | mode=NameKeyword / NameRegex | 生成按名称筛选的节点集合 | 分组成员位置值直接引用 `name` |
| `PLUGIN`        | —                            | 生成插件资源配置         | 输出到 Plugin 节              |

参考：[节点筛选](https://nsloon.app/docs/Node/nodefilter/)、[官方配置示例](https://github.com/Loon0x00/LoonExampleConfig/blob/master/example.conf)。

| 字段 / 位置值  | 类型               | 作用             | 默认值   | 必需性 | 生效条件                                                              |
| -------------- | ------------------ | ---------------- | -------- | ------ | --------------------------------------------------------------------- |
| `name`         | 字符串             | 筛选结果名称     | —        | 必填   | 可作为分组成员引用                                                    |
| `mode`         | 枚举               | 筛选方式         | —        | 必填   | NameKeyword / NameRegex；目标中为名称等号后的首个位置值               |
| `subscription` | 订阅名称或名称数组 | 限定节点筛选范围 | 全部节点 | 可选   | NameKeyword / NameRegex；目标在筛选模式之后按顺序写入订阅名称位置列表 |
| `FilterKey`    | 字符串             | 名称关键词       | —        | 必填   | NameKeyword                                                           |
| `FilterKey`    | 正则               | 名称匹配表达式   | —        | 必填   | NameRegex                                                             |

subscription 指定订阅配置名称；单个来源使用字符串，多个来源使用有序数组。目标 Remote Filter 按来源顺序写入订阅名称。示例中的 Subs 引用已定义的订阅。

声明示例：

```ini
custom=REMOTE_FILTER,name=香港筛选,mode=NameKeyword,subscription=Subs,FilterKey="香港"
custom=REMOTE_FILTER,name=其他筛选,mode=NameRegex,subscription=Subs,FilterKey="^(?!.*香港).*$"
```

目标输出示例：

```ini
[Remote Filter]
香港筛选 = NameKeyword,Subs,FilterKey="香港"
其他筛选 = NameRegex,Subs,FilterKey="^(?!.*香港).*$"
```

`PLUGIN` 将 `url` 映射为资源地址位置值，其余具名参数保持名称和值，按声明顺序输出到 `[Plugin]`。`url` 必须为非空字符串；`tag`、`enabled` 等字段按 Loon 原生语义传入。

```ini
custom=PLUGIN,url=https://example.com/plugin.lpx,tag=示例插件,enabled=true
```

```ini
[Plugin]
https://example.com/plugin.lpx,tag=示例插件,enabled=true
```

不支持的 custom 模式在编译时拒绝。

### Clash（Mihomo）

#### proxy_group

| 支持的模式                                       | 参考文档                                                  |
| ------------------------------------------------ | --------------------------------------------------------- |
| `select`、`url-test`、`fallback`、`load-balance` | [代理组](https://wiki.metacubex.one/config/proxy-groups/) |

参考：[通用字段](https://wiki.metacubex.one/config/proxy-groups/)、[URLTest](https://wiki.metacubex.one/config/proxy-groups/url-test/)、[负载均衡](https://wiki.metacubex.one/config/proxy-groups/load-balance/)。

| 字段 / 位置值           | 类型              | 作用                     | 默认值         | 必需性 | 生效条件                                                                                              |
| ----------------------- | ----------------- | ------------------------ | -------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| 成员（位置值）          | 有序名称列表      | 显式成员，输出为 proxies | —              | 可选   | 可与 use、自动引入选项共同提供候选                                                                    |
| `icon`                  | 字符串            | 向 API 提供图标          | 未注明         | 可选   | 需要使用 API 的前端适配                                                                               |
| `hidden`                | 布尔              | 向 API 提供隐藏状态      | 未注明         | 可选   | 需要使用 API 的前端适配                                                                               |
| `use`                   | provider 名称数组 | 引入代理集合             | —              | 可选   | 集合已定义；include-all-providers 启用时由后者决定集合来源                                            |
| `url`                   | URL               | 健康检查地址             | 未注明         | 未注明 | 检查 proxies 显式成员；use 的成员由 provider 自身健康检查负责                                         |
| `interval`              | 秒                | 定时健康检查周期         | 未注明         | 可选   | 非 0 时启用定时检查                                                                                   |
| `timeout`               | 毫秒              | 健康检查超时             | 未注明         | 可选   | 健康检查启用时                                                                                        |
| `lazy`                  | 布尔              | 分组未使用时暂停定时检查 | true           | 可选   | 健康检查启用时                                                                                        |
| `max-failed-times`      | 整数              | 触发强制检查的失败次数   | 5              | 可选   | 健康检查                                                                                              |
| `expected-status`       | 状态码表达式      | 可接受的 HTTP 状态码     | *              | 可选   | 健康检查；可使用斜杠分隔和范围表达式                                                                  |
| `default-selected`      | 成员名            | 默认选择的成员           | 首个成员       | 可选   | 选择成员时；名称不存在时使用首个成员                                                                  |
| `empty-fallback`        | 节点名            | 空分组的回退节点         | COMPATIBLE     | 可选   | 候选为空时；值为节点名称                                                                              |
| `disable-udp`           | 布尔              | 禁用 UDP                 | 未注明         | 可选   | 分组流量                                                                                              |
| `include-all`           | 布尔              | 引入全部节点和代理集合   | 未注明         | 可选   | 结果按名称排序                                                                                        |
| `include-all-proxies`   | 布尔              | 引入全部节点             | 未注明         | 可选   | 动态成员来源                                                                                          |
| `include-all-providers` | 布尔              | 引入全部代理集合         | 未注明         | 可选   | 启用时覆盖 use 的集合选择                                                                             |
| `filter`                | 正则              | 选择动态来源成员         | —              | 可选   | 引入代理集合或全部代理节点时                                                                          |
| `exclude-filter`        | 正则              | 排除成员                 | —              | 可选   | 成员筛选                                                                                              |
| `exclude-type`          | 字符串            | 按代理类型排除           | —              | 可选   | 多个类型以竖线分隔，不区分大小写；仅排除 proxies 引入的节点                                           |
| `tolerance`             | 毫秒              | 切换容差                 | 未注明         | 可选   | url-test                                                                                              |
| `strategy`              | 枚举              | 负载均衡策略             | 未注明         | 可选   | load-balance；round-robin / consistent-hashing / sticky-sessions                                      |
| `hash-key`              | 字符串            | 指定哈希键               | 使用策略默认键 | 可选   | load-balance 且 strategy=consistent-hashing / sticky-sessions；值为 in-user；未认证请求使用策略默认键 |

hash-key 仅用于哈希策略；strategy=round-robin 时不填写 hash-key。

声明示例：

```ini
proxy_group=代理访问`select`香港节点`DIRECT`icon=https://example.com/proxy.png
```

目标输出示例：

```yaml
proxy-groups:
  - name: 代理访问
    type: select
    proxies:
      - 香港节点
      - DIRECT
    icon: https://example.com/proxy.png
```

#### ruleset

| 支持的 kind                                                                                                                                                                                                                                                                                                                                                                                                                                | 适用说明                                                                                                                                                                | 参考文档                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `DOMAIN`、`DOMAIN-SUFFIX`、`DOMAIN-KEYWORD`、`DOMAIN-WILDCARD`、`DOMAIN-REGEX`、`GEOSITE`、`IP-CIDR`、`IP-CIDR6`、`IP-SUFFIX`、`IP-ASN`、`GEOIP`、`RULE-SET`、`SRC-IP-CIDR`、`SRC-IP-SUFFIX`、`SRC-IP-ASN`、`SRC-GEOIP`、`SRC-PORT`、`DST-PORT`、`IN-PORT`、`IN-TYPE`、`IN-USER`、`IN-NAME`、`PROCESS-NAME`、`PROCESS-NAME-REGEX`、`PROCESS-PATH`、`PROCESS-PATH-REGEX`、`UID`、`NETWORK`、`DSCP`、`SUB-RULE`、`AND`、`OR`、`NOT`、`MATCH` | `RULE-SET` 使用集合名称；HTTP 资源声明使用 url；`SUB-RULE` 调用子规则，出口位置填写子规则名。进程、用户和入站条件按运行平台与入站配置使用；`MATCH` 无匹配值，作为兜底。 | [路由规则](https://wiki.metacubex.one/config/rules/)、[规则集合](https://wiki.metacubex.one/config/rule-providers/) |

参考：[路由规则](https://wiki.metacubex.one/config/rules/)、[规则集合](https://wiki.metacubex.one/config/rule-providers/)。

| 字段 / 位置值            | 类型                 | 作用                               | 默认值                      | 必需性                      | 生效条件                                                                 |
| ------------------------ | -------------------- | ---------------------------------- | --------------------------- | --------------------------- | ------------------------------------------------------------------------ |
| 匹配值或集合名（位置值） | 字符串或逻辑表达式   | 原生规则条件、已定义的规则集合名称 | —                           | MATCH 之外按规则要求        | RULE-SET 引用集合名；SUB-RULE 使用条件表达式，出口位置为子规则名         |
| `no-resolve`             | 无值标记             | 不为目标 IP 匹配主动解析 DNS       | 不启用                      | 可选                        | IP-CIDR / IP-CIDR6 / GEOIP / IP-ASN / IP-SUFFIX；RULE-SET 包含 IP 条件时 |
| `src`                    | 无值标记             | 用来源 IP 进行 IP 匹配             | 不启用                      | 可选                        | IP-CIDR / IP-CIDR6 / GEOIP / IP-ASN / IP-SUFFIX / RULE-SET               |
| `type`                   | 枚举                 | 规则集合资源来源                   | —                           | 资源定义必填                | http / file / inline                                                     |
| `behavior`               | 枚举                 | 资源内容的规则模式                 | —                           | 资源定义必填                | classical / domain / ipcidr                                              |
| `format`                 | 枚举                 | 资源文件格式                       | yaml                        | 可选                        | yaml / text / mrs；mrs 仅用于 behavior=domain / ipcidr                   |
| `url`                    | URL                  | 规则资源地址                       | —                           | type=http 时必填            | HTTP 规则集合资源                                                        |
| `path`                   | 文件路径             | 资源文件或下载缓存位置             | HTTP 缓存按 URL 的 MD5 命名 | type=file 时必填；http 可选 | 受 HomeDir 安全路径限制；额外路径需配置 SAFE_PATHS                       |
| `interval`               | 秒                   | HTTP 资源更新周期                  | 未注明                      | 可选                        | type=http                                                                |
| `proxy`                  | 出口名               | 下载资源使用的出口                 | 未注明                      | 可选                        | type=http                                                                |
| `header`                 | 字符串数组组成的对象 | HTTP 请求头                        | —                           | 可选                        | type=http；各请求头的值为数组                                            |
| `size-limit`             | 字节                 | 下载资源大小上限                   | 0                           | 可选                        | type=http；0 表示不限制                                                  |
| `payload`                | 数组                 | 内联规则内容                       | —                           | type=inline 时提供          | 各项符合 behavior 定义的内容格式                                         |
| `path-in-bundle`         | 路径                 | 包内初始资源                       | —                           | 可选                        | 本地资源文件缺失时使用                                                   |

资源声明的字段属于 rule-providers 中的集合条目；规则引用使用已有集合名称。behavior=classical 的文件内容为完整原生规则，domain / ipcidr 的内容分别为域名条件 / IP 网段。

资源名称从资源原始地址自动生成，遵循下表规则。实现依据：[资源名称生成](../lib/subscription/compile/drivers/rules/clash.ts)。

| 情况                       | 命名规则                                                                                                         | 示例                                                       |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 基础名称                   | 对原始地址字符串取最后一个斜杠之后、最后一个点号之前的内容；最后一个点号在斜杠之前时取到字符串末尾               | https://example.com/proxy-classical.yaml → proxy-classical |
| 地址解码                   | 基础名称中的加号转为空格；有效的百分号十六进制序列按字节解码为 UTF-8，并移除回车、换行字节；其他名称字符原样保留 | Proxy+List.yaml、Proxy%20List.yaml → Proxy List            |
| 生成列表内重名             | 按声明顺序、区分大小写检查已生成名称；重名后追加空格与整数，从 2 开始递增，直至未占用                            | Proxy、Proxy 2、Proxy 3                                    |
| 相同地址重复声明           | 每条声明生成独立资源，并按重名规则命名                                                                           | 两次 Proxy.yaml → Proxy、Proxy 2                           |
| 模板已有同名资源           | 模板资源名不参与生成名称的重名避让；同名条目为对象时先保留其字段，再写入生成字段，同名字段以生成值为准           | 模板已有 Proxy，首次生成仍使用 Proxy                       |
| 原始地址中的查询参数与片段 | 基础名称截取针对完整原始地址，不先剥离查询参数或片段；最后一个斜杠和点号也按该完整字符串定位                     | 不按 URL pathname 另行推导资源名                           |
| 规则引用                   | 使用最终确定的资源名称作为 RULE-SET 的集合名称                                                                   | RULE-SET,Proxy 2,代理访问                                  |

资源名称与缓存文件名称分别生成，各自应用命名规则。

声明示例：

```ini
ruleset=代理访问,RULE-SET,type=http,url=https://example.com/proxy-classical.yaml,behavior=classical,format=yaml,interval=86400
ruleset=代理访问,RULE-SET,type=http,url=https://example.com/proxy-domain.mrs,behavior=domain,format=mrs,interval=86400
ruleset=DIRECT,GEOIP,CN,no-resolve
ruleset=代理访问,MATCH
```

目标输出示例：

资源名称 proxy-classical、proxy-domain 分别对应两个资源地址的文件名，规则使用相应名称引用集合。

```yaml
rule-providers:
  proxy-classical:
    type: http
    url: https://example.com/proxy-classical.yaml
    behavior: classical
    format: yaml
    interval: 86400
  proxy-domain:
    type: http
    url: https://example.com/proxy-domain.mrs
    behavior: domain
    format: mrs
    interval: 86400

rules:
  - RULE-SET,proxy-classical,代理访问
  - RULE-SET,proxy-domain,代理访问
  - GEOIP,CN,DIRECT,no-resolve
  - MATCH,代理访问
```

### Quantumult X

#### proxy_group

| 支持的模式                                                                         | 参考文档                                                                            |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `static`、`available`、`round-robin`、`dest-hash`、`url-latency-benchmark`、`ssid` | [sample.conf](https://github.com/crossutility/Quantumult-X/blob/master/sample.conf) |

参考：[官方 sample.conf](https://github.com/crossutility/Quantumult-X/blob/master/sample.conf)。

| 字段 / 位置值                           | 类型           | 作用                   | 默认值 | 必需性                 | 生效条件                                                             |
| --------------------------------------- | -------------- | ---------------------- | ------ | ---------------------- | -------------------------------------------------------------------- |
| 成员（位置值）                          | 有序节点名列表 | 显式候选成员           | —      | 与筛选参数共同提供候选 | static / available / round-robin / dest-hash / url-latency-benchmark |
| `img-url`                               | URL            | 分组图标               | 未注明 | 可选                   | static                                                               |
| `resource-tag-regex`                    | 正则           | 按订阅资源标签筛选成员 | 未注明 | 可选                   | static / available / round-robin                                     |
| `server-tag-regex`                      | 正则           | 按节点标签筛选成员     | 未注明 | 可选                   | static / available / round-robin                                     |
| `check-interval`                        | 秒             | 延迟测试周期           | 未注明 | 可选                   | url-latency-benchmark；分组被请求使用时计入周期                      |
| `alive-checking`                        | 布尔           | 空闲时仍定期测试       | 未注明 | 可选                   | url-latency-benchmark；true 时空闲期也按 check-interval 检查         |
| `tolerance`                             | 毫秒           | 延迟选择容差           | 未注明 | 可选                   | url-latency-benchmark                                                |
| 默认策略、蜂窝策略、SSID:策略（位置值） | 有序列表       | 按网络环境选择策略     | 未注明 | 按网络选择需求填写     | ssid；保持原生位置次序                                               |

声明示例：

```ini
proxy_group=代理访问`static`香港节点`direct`img-url=https://example.com/proxy.png
```

目标输出示例：

```ini
[policy]
static = 代理访问,香港节点,direct,img-url=https://example.com/proxy.png
```

#### ruleset

| 支持的 kind                                                                                                                         | 适用说明                                                                                                    | 参考文档                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `HOST`、`HOST-SUFFIX`、`HOST-KEYWORD`、`HOST-WILDCARD`、`IP-CIDR`、`IP6-CIDR`、`GEOIP`、`IP-ASN`、`RULE-SET`、`USER-AGENT`、`FINAL` | `RULE-SET` 表示 filter_remote，位置值为 URL；域名使用 HOST 系列，IPv6 网段使用 IP6-CIDR；`FINAL` 无匹配值。 | [规则示例](https://github.com/crossutility/Quantumult-X/blob/master/sample.conf) |

参考：[官方 sample.conf](https://github.com/crossutility/Quantumult-X/blob/master/sample.conf)。

| 字段 / 位置值              | 类型         | 作用                                    | 默认值           | 必需性         | 生效条件                                                              |
| -------------------------- | ------------ | --------------------------------------- | ---------------- | -------------- | --------------------------------------------------------------------- |
| 匹配值或资源地址（位置值） | 字符串       | 本地条件或远程过滤资源                  | —                | FINAL 之外必填 | RULE-SET 使用 URL 或内置资源 FILTER_REGION / FILTER_LAN               |
| `tag`                      | 字符串       | 远程过滤资源标签                        | 未注明           | 可选           | filter_remote                                                         |
| 出口（第一字段）           | 策略名       | 生成 force-policy，覆盖远程内容中的策略 | 保留资源中的策略 | 可选           | filter_remote；force-policy 由第一字段唯一提供；为空时省略            |
| `enabled`                  | 布尔         | 启用资源                                | 未注明           | 可选           | filter_remote                                                         |
| `update-interval`          | 秒           | 资源同步周期                            | 86400            | 可选           | filter_remote；负数关闭自动同步                                       |
| `require-devices`          | 设备 ID 列表 | 限制加载资源的设备                      | 不限制           | 可选           | filter_remote；当前设备 ID 包含于列表时加载；多个 ID 使用原生逗号分隔 |
| `inserted-resource`        | 布尔         | 标记内置插入资源                        | 未注明           | 可选           | FILTER_REGION / FILTER_LAN                                            |
| `force-cellular`           | 无值标记     | 使用蜂窝网络接口                        | 不启用           | 可选           | filter_local；设备需有可用蜂窝接口                                    |
| `multi-interface`          | 无值标记     | 启用多接口连接                          | 不启用           | 可选           | filter_local；依赖可用网络接口                                        |
| `multi-interface-balance`  | 无值标记     | 在多接口间分配连接                      | 不启用           | 可选           | filter_local；依赖可用网络接口                                        |
| `via-interface`            | 接口名       | 指定连接使用的接口                      | 未指定           | 可选           | filter_local；接口须可用，例如 pdp_ip0                                |

远程资源的 force-policy 由声明第一字段提供；第一字段为空时保留资源各条目的策略。SSID、图标和资源标签的字段按各自原生作用域使用。

声明示例：

```ini
ruleset=代理访问,RULE-SET,https://example.com/proxy.snippet,tag=代理访问,enabled=true
ruleset=direct,GEOIP,CN
ruleset=代理访问,FINAL
```

目标输出示例：

```ini
[filter_remote]
https://example.com/proxy.snippet,tag=代理访问,force-policy=代理访问,enabled=true

[filter_local]
geoip,CN,direct
final,代理访问
```

### sing-box

#### proxy_group

| 支持的模式            | 参考文档                                                                                                                                             |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `selector`、`urltest` | [Selector](https://sing-box.sagernet.org/configuration/outbound/selector/)、[URLTest](https://sing-box.sagernet.org/configuration/outbound/urltest/) |

参考：[Selector](https://sing-box.sagernet.org/configuration/outbound/selector/)、[URLTest](https://sing-box.sagernet.org/configuration/outbound/urltest/)。

| 字段 / 位置值                 | 类型             | 作用                       | 默认值                               | 必需性 | 生效条件                                   |
| ----------------------------- | ---------------- | -------------------------- | ------------------------------------ | ------ | ------------------------------------------ |
| 成员（位置值）                | 有序出站标签列表 | 候选出站，输出为 outbounds | —                                    | 必填   | selector / urltest                         |
| `default`                     | 出站标签         | 默认选择                   | 首个出站                             | 可选   | selector；值为候选出站标签                 |
| `interrupt_exist_connections` | 布尔             | 切换后中断已有入站连接     | false                                | 可选   | selector / urltest；内部连接始终随切换中断 |
| `url`                         | URL              | 探测地址                   | https://www.gstatic.com/generate_204 | 可选   | urltest                                    |
| `interval`                    | 时长             | 测试周期                   | 3m                                   | 可选   | urltest；使用带单位的时长                  |
| `tolerance`                   | 毫秒             | 切换容差                   | 50                                   | 可选   | urltest                                    |
| `idle_timeout`                | 时长             | 空闲超时                   | 30m                                  | 可选   | urltest                                    |

声明示例：

```ini
proxy_group=代理访问`selector`香港节点`DIRECT
proxy_group=自动选择`urltest`香港节点`url=http://www.gstatic.com/generate_204`interval=30s`tolerance=50
```

目标输出示例：

```json
{
  "outbounds": [
    {
      "type": "selector",
      "tag": "代理访问",
      "outbounds": ["香港节点", "DIRECT"]
    },
    {
      "type": "urltest",
      "tag": "自动选择",
      "outbounds": ["香港节点"],
      "url": "http://www.gstatic.com/generate_204",
      "interval": "30s",
      "tolerance": 50
    }
  ]
}
```

#### ruleset

| 支持的 kind                          | 适用说明                                                                                                                                               | 参考文档                                                                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `INLINE`、`LOCAL`、`REMOTE`、`FINAL` | INLINE / LOCAL / REMOTE 定义 route.rule_set 资源，第一字段为资源 tag；FINAL 设置 route.final，第一字段为出站标签。资源引用与路由动作在 custom 中声明。 | [Route](https://sing-box.sagernet.org/configuration/route/)、[规则集](https://sing-box.sagernet.org/configuration/rule-set/) |

参考：[Route](https://sing-box.sagernet.org/configuration/route/)、[规则集](https://sing-box.sagernet.org/configuration/rule-set/)、[Headless Rule](https://sing-box.sagernet.org/configuration/rule-set/headless-rule/)、[HTTP Client](https://sing-box.sagernet.org/configuration/shared/http-client/)。

资源声明格式为 `ruleset=<tag>,<KIND>,<字段=值>...`，用于定义 `route.rule_set` 数组中的资源条目。目标 tag 由第一字段提供；目标 type 由 INLINE / LOCAL / REMOTE 的小写值提供。`ruleset=<出站标签>,FINAL` 设置 route.final，使用两个字段。资源标签的匹配引用属于 `route.rules`，在 [custom 的 sing-box 配置](#路由规则-routerules)中定义。

| 字段 / 位置值       | 类型                   | 作用                       | 默认值                                                         | 必需性         | 生效条件                                                                                             |
| ------------------- | ---------------------- | -------------------------- | -------------------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------- |
| KIND（第二字段）    | 枚举                   | 指定资源类型或默认出站配置 | —                                                              | 必填           | INLINE / LOCAL / REMOTE 输出资源 type；FINAL 设置 route.final；INLINE 需 1.10+                       |
| `tag`（第一字段）   | 字符串或标签数组       | 资源标签                   | —                                                              | 资源声明必填   | LOCAL / REMOTE 在 1.14+ 支持多标签；多标签时 path / url / initial_path 需包含 {tag}；INLINE 仅单标签 |
| `rules`             | Headless Rule 对象数组 | 内联资源内容               | —                                                              | INLINE 必填    | 1.10+；内容遵循原生 Headless Rule                                                                    |
| `format`            | 枚举                   | 规则集文件格式             | 按扩展名判断                                                   | 条件必填       | LOCAL / REMOTE；source / binary；path 或 url 扩展名为 json / srs 时可省略，否则必填                  |
| `path`              | 文件路径               | 本地规则集                 | —                                                              | LOCAL 必填     | 1.10+ 文件变化后自动重新加载                                                                         |
| `url`               | URL                    | 远程规则集地址             | —                                                              | REMOTE 必填    | 远程资源下载                                                                                         |
| `initial_path`      | 文件路径               | 远程资源初始内容           | —                                                              | 可选           | 1.14+；启动时无缓存可用时使用                                                                        |
| `http_client`       | HTTP Client 标签或对象 | 远程资源下载客户端         | route.default_http_client 指定项，否则首个顶层 http_clients 项 | 可选           | 1.14+；标签须已定义；对象按原生 HTTP Client 字段配置                                                 |
| `update_interval`   | 时长                   | 远程资源更新周期           | 1d                                                             | 可选           | REMOTE；使用带单位的时长                                                                             |
| `final`（第一字段） | 出站标签               | 默认出站                   | 未声明时使用首个出站                                           | FINAL 声明必填 | 引用已定义出站；写入 route.final                                                                     |

`http_client` 使用对象时，以下字段直接置于该对象内：

| 字段                       | 类型       | 作用                     | 默认值 | 必需性 | 生效条件                                                  |
| -------------------------- | ---------- | ------------------------ | ------ | ------ | --------------------------------------------------------- |
| `engine`                   | 枚举       | HTTP 引擎                | go     | 可选   | go / apple；apple 仅限 Apple 平台                         |
| `version`                  | 整数       | HTTP 版本                | 2      | 可选   | engine=go；1 / 2 / 3；2 使用 HTTP2 字段，3 使用 QUIC 字段 |
| `disable_version_fallback` | 布尔       | 禁止回退到较低 HTTP 版本 | false  | 可选   | engine=go                                                 |
| `headers`                  | 请求头对象 | 自定义 HTTP 请求头       | —      | 可选   | Host 作为请求主机名                                       |
| `detour`                   | 出站标签   | 下载连接的上游出站       | —      | 可选   | 引用已定义出站；设置后其他拨号字段不生效                  |

其余嵌套字段按 [HTTP Client 原生字段及引擎条件](https://sing-box.sagernet.org/configuration/shared/http-client/)填写。engine=apple 时，TLS 仅使用 server_name、insecure、min_version、max_version、certificate、certificate_path、certificate_sha256、certificate_public_key_sha256；server_name 必须与请求主机名一致。

INLINE 的 rules 是规则集内容，使用 Headless Rule；其中不包含路由动作 action、outbound。资源定义与匹配引用独立声明，标签须保持一致。

声明示例：

```ini
ruleset=private-domains,INLINE,rules=[{"domain_suffix":["example.internal"]}]
ruleset=local-domains,LOCAL,path=./rules/local.json,format=source
ruleset=geoip-cn,REMOTE,url=https://example.com/cn.srs,format=binary,update_interval=1d,http_client={"detour":"DIRECT"}
ruleset=代理访问,FINAL
```

目标输出示例：

```json
{
  "route": {
    "rule_set": [
      {
        "type": "inline",
        "tag": "private-domains",
        "rules": [
          {
            "domain_suffix": ["example.internal"]
          }
        ]
      },
      {
        "type": "local",
        "tag": "local-domains",
        "path": "./rules/local.json",
        "format": "source"
      },
      {
        "type": "remote",
        "tag": "geoip-cn",
        "url": "https://example.com/cn.srs",
        "format": "binary",
        "update_interval": "1d",
        "http_client": {
          "detour": "DIRECT"
        }
      }
    ],
    "final": "代理访问"
  }
}
```

#### custom

| 配置项      | 第一字段       | 作用                   | 引用方式                             |
| ----------- | -------------- | ---------------------- | ------------------------------------ |
| route.rules | 原生 action 值 | 声明路由匹配条件及动作 | rule_set 字段引用 ruleset 资源的 tag |

参考：[Route](https://sing-box.sagernet.org/configuration/route/)、[路由规则](https://sing-box.sagernet.org/configuration/route/rule/)、[规则动作](https://sing-box.sagernet.org/configuration/route/rule_action/)。

##### 路由规则 route.rules

`custom=<action>,<字段=值>...` 声明 route.rules 中的一个条目。目标规则的 action 由第一字段 `kind` 唯一提供。多个匹配条件在同一条声明内使用原生字段组合，出口使用 outbound。相同 action 的多条声明分别生成规则，并保持声明顺序。

| 字段 / 位置值                   | 类型               | 作用                         | 默认值  | 必需性                     | 生效条件                                                                                                             |
| ------------------------------- | ------------------ | ---------------------------- | ------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `type`                          | 枚举               | 路由规则结构                 | default | 可选；逻辑规则必填 logical | default 为普通规则；logical 为逻辑规则                                                                               |
| `mode`                          | 枚举               | 逻辑组合方式                 | —       | type=logical 时必填        | and / or                                                                                                             |
| `rules`                         | 路由子规则对象数组 | 逻辑规则的子条件             | —       | type=logical 时必填        | 子规则按原生逻辑规则结构填写                                                                                         |
| `domain`                        | 字符串数组         | 完整域名                     | —       | 可选                       | 路由匹配                                                                                                             |
| `domain_suffix`                 | 字符串数组         | 域名后缀                     | —       | 可选                       | 路由匹配                                                                                                             |
| `domain_keyword`                | 字符串数组         | 域名关键词                   | —       | 可选                       | 路由匹配                                                                                                             |
| `domain_regex`                  | 字符串数组         | 域名正则                     | —       | 可选                       | 路由匹配                                                                                                             |
| `ip_version`                    | 整数               | IP 版本                      | —       | 可选                       | 4 / 6                                                                                                                |
| `ip_cidr`                       | 字符串数组         | 目标 IP 网段                 | —       | 可选                       | IP 匹配                                                                                                              |
| `ip_is_private`                 | 布尔               | 目标 IP 为私有地址           | false   | 可选                       | 普通规则                                                                                                             |
| `source_ip_cidr`                | 字符串数组         | 来源 IP 网段                 | —       | 可选                       | 来源匹配                                                                                                             |
| `source_ip_is_private`          | 布尔               | 来源 IP 为私有地址           | false   | 可选                       | 普通规则                                                                                                             |
| `wifi_ssid`                     | 字符串数组         | Wi-Fi 名称                   | —       | 可选                       | Android / Apple 图形客户端；1.13+ 的 Linux 需 NetworkManager / IWD / wpa_supplicant / ConnMan，Windows 使用 WLAN API |
| `wifi_bssid`                    | 字符串数组         | Wi-Fi 接入点地址             | —       | 可选                       | Android / Apple 图形客户端；1.13+ 的 Linux 需 NetworkManager / IWD / wpa_supplicant / ConnMan，Windows 使用 WLAN API |
| `inbound`                       | 标签数组           | 入站标签                     | —       | 可选                       | 引用已定义入站                                                                                                       |
| `protocol`                      | 字符串数组         | 已识别的应用协议             | —       | 可选                       | 流量已有可识别的协议元数据                                                                                           |
| `network`                       | 字符串数组         | 网络协议                     | —       | 可选                       | tcp / udp；1.13+ 支持 icmp，受入站和出站类型限制                                                                     |
| `process_name`                  | 字符串数组         | 进程名                       | —       | 可选                       | Linux / Windows / macOS                                                                                              |
| `process_path`                  | 字符串数组         | 进程路径                     | —       | 可选                       | Linux / Windows / macOS                                                                                              |
| `package_name`                  | 字符串数组         | Android 应用包名             | —       | 可选                       | Android                                                                                                              |
| `port`                          | 整数数组           | 目标端口                     | —       | 可选                       | 端口匹配                                                                                                             |
| `port_range`                    | 字符串数组         | 目标端口范围                 | —       | 可选                       | 使用起点:终点；可省略一端                                                                                            |
| `source_port`                   | 整数数组           | 来源端口                     | —       | 可选                       | 来源端口匹配                                                                                                         |
| `source_port_range`             | 字符串数组         | 来源端口范围                 | —       | 可选                       | 使用起点:终点；可省略一端                                                                                            |
| `auth_user`                     | 字符串数组         | 入站认证用户名               | —       | 可选                       | 入站启用用户认证                                                                                                     |
| `user_id`                       | 整数数组           | 操作系统用户 ID              | —       | 可选                       | Linux                                                                                                                |
| `rule_set`                      | 标签数组           | 引用已定义规则集             | —       | 可选                       | 标签对应资源已定义                                                                                                   |
| `rule_set_ip_cidr_match_source` | 布尔               | 规则集的 IP 网段匹配来源地址 | false   | 可选                       | 配置 rule_set 时                                                                                                     |
| `invert`                        | 布尔               | 反转匹配结果                 | false   | 可选                       | 路由规则                                                                                                             |
| `action`（第一字段）            | 枚举               | 原生规则动作                 | —       | 必填                       | 直接填写原生动作值；route 使用 outbound，reject 不配置 outbound                                                      |
| `outbound`                      | 出站标签           | route 动作的出口             | —       | action=route 时必填        | 引用已定义出站                                                                                                       |

rule_set 引用 route.rule_set 中的资源标签。type=logical 使用 mode、rules 组合子条件，普通匹配字段用于 default 规则。不同字段之间的组合关系遵循原生路由逻辑。network=icmp 自 1.13 起仅用于 tun / WireGuard / Tailscale 入站，且限 direct / WireGuard / Tailscale 出站。

action 的字段和条件按 [Rule Action](https://sing-box.sagernet.org/configuration/route/rule_action/)配置；route 的 outbound 必填，reject 不配置 outbound。匹配条件、逻辑子条件与动作按各自原生作用域保存。

声明示例：

```ini
custom=route,ip_is_private=true,outbound=DIRECT
custom=route,rule_set=["geoip-cn"],outbound=DIRECT
custom=reject,domain_suffix=["ads.example.com"]
custom=route,type=logical,mode=or,rules=[{"domain_suffix":["example.internal"]},{"rule_set":["private-domains"]}],outbound=DIRECT
```

目标输出示例：

```json
{
  "route": {
    "rules": [
      {
        "ip_is_private": true,
        "action": "route",
        "outbound": "DIRECT"
      },
      {
        "rule_set": ["geoip-cn"],
        "action": "route",
        "outbound": "DIRECT"
      },
      {
        "domain_suffix": ["ads.example.com"],
        "action": "reject"
      },
      {
        "type": "logical",
        "mode": "or",
        "rules": [
          {
            "domain_suffix": ["example.internal"]
          },
          {
            "rule_set": ["private-domains"]
          }
        ],
        "action": "route",
        "outbound": "DIRECT"
      }
    ]
  }
}
```
