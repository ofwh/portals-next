# Sub-Store 输出格式与节点参数

## 依据与范围

本文档以 Sub-Store 的 producer 注册及实际序列化分支为准，规范来源固定为源码版本，不将客户端理论能力或 SubConverter-Extended 的目标名称混入该版本的输出格式。

源码基准：[Sub-Store `352f01b7091c`](https://github.com/sub-store-org/Sub-Store/blob/352f01b7091c99f4e219c44e4ec96f3288059843/backend/src/core/proxy-utils/producers/index.js)。这属于文档适用的版本边界，不表示其他版本具有相同字段与能力。

## 阅读约定

- 类型写输出中的原生类型。INI/URI 的所有线格式值是文本；Boolean/Number 注明其解析后的语义，不能与 YAML/JSON 的真实布尔和数字混淆。
- “未声明”表示 producer 没有给出默认值，不代表客户端默认 false、0 或空 String。“有值才写”“仅 true 才写”和“非 null 时写”是不同分支。
- “必须”区分正常连接所需的结构字段与源码显式校验；producer 并非统一运行时 schema，源码插值可能输出 undefined，不能据此认为字段可省略。
- 表中的选项只在源码显式限定或格式判别处作为闭合集合；开放透传对象不伪造完整枚举。部分字段可能按来源保留 String/Number；不得为简化文档虚构单一类型。
- 位置字段、重复参数、嵌套对象、私有扩展分别记录。原生输出、规范化输入与 producer 的控制选项不是同一层级。
- 文档整理 Sub-Store 的行为，不声明本仓库已经实现全部目标或全部参数。代码对齐时保留本仓库已有目标的语义边界；外部命名差异须显式映射。

## 输出索引

| 输出类型            | 实际结构                            | producer / 常见别名                                                | 节点参数                        |
| ------------------- | ----------------------------------- | ------------------------------------------------------------------ | ------------------------------- |
| Clash               | YAML proxies 列表                   | Clash、clash                                                       | [Clash](clash.md)               |
| Clash.Meta / Mihomo | YAML proxies 列表                   | meta、clashmeta、clash.meta、Clash.Meta、ClashMeta、mihomo、Mihomo | [Mihomo](clashmeta.md)          |
| Stash               | YAML proxies 列表                   | stash、Stash                                                       | [Stash](stash.md)               |
| Shadowrocket        | YAML proxies 列表                   | shadowrocket、Shadowrocket、ShadowRocket                           | [Shadowrocket](shadowrocket.md) |
| Egern               | YAML proxies 列表；元素按协议名包装 | egern、Egern                                                       | [Egern](egern.md)               |
| sing-box            | JSON outbounds + endpoints          | singbox、sing-box                                                  | [sing-box](sing-box.md)         |
| Surge               | INI 代理行 String                   | surge、Surge                                                       | [Surge](surge.md)               |
| SurgeMac            | INI 原生/External 行 String         | SurgeMac                                                           | [SurgeMac](surgemac.md)         |
| Surfboard           | INI 代理行 String                   | surfboard、Surfboard                                               | [Surfboard](surfboard.md)       |
| Loon                | INI 代理行 String                   | Loon                                                               | [Loon](loon.md)                 |
| Quantumult X        | server_local 行 String              | qx、QX、QuantumultX                                                | [QX](qx.md)                     |
| URI                 | 各协议分享链接 String               | uri、URI                                                           | [URI](uri.md)                   |
| V2Ray               | Base64 包装的逐行 URI String        | v2、v2ray、V2Ray                                                   | [V2Ray](v2ray.md)               |
| JSON                | 规范化节点 JSON Array               | json、JSON                                                         | [JSON](index.md)                |

YAML 的共用定义仅在[公共字段](common.md)与[YAML 节点字段](yaml-fields.md)完整维护；各目标页面维护准入、字段变化与默认值差异。INI 的共同文本语义见[INI 公共字段](ini-common.md)。

## 与本仓库输出命名的关系

| 本仓库名称                    | Sub-Store 对应参考                   | 约束                                                    |
| ----------------------------- | ------------------------------------ | ------------------------------------------------------- |
| Clash / Mihomo (`clash`)      | Clash.Meta producer                  | 不应据 Sub-Store 的旧 Clash 限制缩窄 Mihomo             |
| ClashR (`clashr`)             | 无独立 producer                      | 保留本仓库兼容目标；不能杜撰 Sub-Store 的 ClashR schema |
| Shadowsocks(SS) (`ss`)        | URI/V2Ray 的 SS 分支加本仓库协议过滤 | SS JSON provider 不是 SS 链接输出                       |
| Shadowsocks(Mixed) (`mixed`)  | V2Ray Base64 包装 + URI 分支         | “Mixed”不是 Sub-Store 的独立注册目标                    |
| Shadowrocket (`shadowrocket`) | URI 编码及本仓库协议准入             | 本仓库保留 Base64 URI 订阅；同名 YAML producer 仅供参考 |
| 其余已注册目标                | 对应同名 producer                    | 不自动新增 Sub-Store 独有目标到工作流选项               |

共享函数的完整默认值、枚举与别名见[参数归一化](normalization.md)。

本目录记录上游 producer 行为。本仓库实际输出优先遵守[输出适配约束](../output-adapter.md#订阅生成节点)中的可选参数保留规则，不自动采用上游默认补值或丢弃显式 false 的行为。

## 生产控制选项

| 选项                               | 类型        | 默认 / 缺省 | 作用                                                   |
| ---------------------------------- | ----------- | ----------- | ------------------------------------------------------ |
| type=internal                      | String 模式 | 外部文本    | 支持的 ALL producer 返回数组，不执行最终文本序列化     |
| include-unsupported-proxy          | Boolean     | 未启用      | 目标分支可扩大准入或取消部分检查；不保证客户端实际支持 |
| prettyYaml / pretty-yaml           | Boolean     | 未启用      | YAML 改用 pretty dump；结构仍为 proxies 列表           |
| mihomoExternal / useMihomoExternal | Boolean     | 未启用      | SurgeMac 的强制外部生成或能力错误回退                  |

## UDP 参数对照

| 输出/节点            | 字段或规则           | 缺省行为                             | 不可混淆的语义                             |
| -------------------- | -------------------- | ------------------------------------ | ------------------------------------------ |
| URI / SS             | udp=0/1              | producer 始终按来源 truthy 写 0 或 1 | 普通 UDP 开关；确实存在输出支持            |
| URI / SS             | uot=1                | udp-over-tcp 为 true 才写            | 封装启用，不是 UOT version=1               |
| URI / SS             | tfo=1                | tfo=true 才写                        | TCP 连接选项                               |
| V2Ray / Mixed 类包装 | 保留内层 URI 参数    | 外层只做 Base64                      | 不得因外层编码丢弃 UDP 参数                |
| YAML 类              | udp: Boolean         | 通常按来源；Snell 等有版本清理       | 不能统一改成 query String                  |
| Surge / Surfboard    | udp-relay=true/false | 依节点分支和源值                     | 不是所有协议都写同一开关                   |
| QX                   | udp-relay=true/false | 源字段存在时写                       | false 不能被 truthy 检查丢失               |
| Loon                 | udp=true             | 部分分支只在 true 时写               | 不直接使用 Surge 的键名或推断 false 会保留 |
| sing-box             | network="tcp"        | udp=false 时；_network 可显式优先    | 不输出通用 udp Boolean                     |
| Egern                | udp_relay            | udp ?? udp_relay                     | 下划线命名                                 |
| VLESS/VMess AEAD URI | packetEncoding       | 按包编码来源                         | 不等于普通 UDP 开关                        |
| TUIC URI             | udp_relay_mode       | 按来源与版本                         | 指包中继方式                               |
| Hysteria v1 URI      | protocol=udp         | 来自底层传输                         | 不是普通应用 UDP Boolean                   |

对齐时先使用本表定位格式和协议，再检查相应页面。源码遗漏不证明协议格式禁止；与官方规范存在差异时，应分开记录“Sub-Store 行为”和“目标规范约束”，不能静默混写。

## 全部参数的查阅入口

每个输出页面均链接同名逐参数全表。全表同时列出显式 native 写入、String 模板参数、输入别名、生产选项、删除字段、嵌套路径、计算键和静态枚举；SurgeMac、V2Ray、JSON 的继承或透明封装关系不复制维护字段。

对于 YAML 开放透传、JSON 透明序列化及 URI 动态标量扩展，参数集合没有有限闭集。完整契约由显式字段表与开放 JSONValue 规则共同构成，不以“未列出”判定不支持。
