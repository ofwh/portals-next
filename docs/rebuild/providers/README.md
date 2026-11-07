# 节点配置

输入为 `base64(URI[].join('\n'))` 文本及明确的启用协议集合。成功数据为有序的 `ProxyNode[]`，每行可附带脱敏诊断。选择范围见[协议清单](协议清单.md)，类型字段见[字段归一化](字段归一化.md)。

## 入口与协议解析器

1. 校验外层 Base64，兼容标准及 URL-safe 字母表、合法的无填充输入，允许包装文本周围空白。整体解码失败时返回输入错误。
2. 仅按 LF 分行，剥除行尾 CR，忽略空行。保留输入顺序与原始行号。URI 内编码的换行先留在 URI 内。
3. 按 URI scheme 和明确的别名变体分派。Telegram 分享链接需校验 host 与 path。URI 结构拆分后再解码对应组件，支持 IPv6、协议专用默认端口及协议自身的 Base64 或 JSON 载荷。各协议的必填项、枚举、范围由各自解析器校验。
4. 未启用或未知协议跳过，已启用但格式错误的行记录错误并继续。注册器预筛 scheme 后仍校验解析得到的规范协议，避免多协议包装 URI 绕过选择。
5. 解析器返回对应协议类型的节点，允许保留原始层级；统一通过 `transform` 转换为完全扁平的 `ProxyNode`，完成同义字段归一化并省略未提供字段后，按原顺序汇总返回。重名保留，目标名称分配由编译模块负责。

协议解析器放在节点配置模块的 `parsers` 子目录（`lib/subscription/providers/parsers`），每协议一个解析器。同一协议变体复用字段归一化。保留缺省和显式 false 的区别。URI 中的名称和端点允许独立保存，诊断中省略凭据和原始 URI。

## 源码与验证

[旧解析分派](/Users/larify/Documents/github/SubConverter-Extended/src/parser/subparser.cpp:5896)的 `explode` 和 `explodeSub` 分别处理单链与多种订阅容器。[Mihomo 桥](/Users/larify/Documents/github/SubConverter-Extended/src/parser/mihomo_bridge.cpp)返回规范映射，旧节点通过 [Proxy](/Users/larify/Documents/github/SubConverter-Extended/src/parser/config/proxy.h) 投影给其他生成器。重构后输入解析器的选择与目标解耦，需分别用两条旧路径有覆盖的样例对照。迁移若借用桥，桥结果在解析模块内投影成领域字段。

验收覆盖 CRLF、空行、无填充、错误 Base64、同一列表中未知协议与坏 URI、重复名称、IPv6、带编码字符的凭据、带协议内部载荷的 VMess/SSR，以及禁用协议不会产生节点。

## 调用契约

从 `lib/subscription/providers` 调用 `parseProviders`。调用方传入 Base64 文本和启用协议集合，可以从同一入口获取 `proxyProtocols`。成功时返回节点与逐行诊断。包装格式错误或订阅超出资源限制时返回整体错误。诊断只含错误码、严重程度、行号及可识别的规范协议。

HTTP(S) 节点使用显式账户信息或旧版 Base64 端点载荷。Telegram 分享链接按精确域名和路径映射到内层协议。Mieru 保留为单个资源，端口和传输绑定按 URI 中的声明顺序保存。
