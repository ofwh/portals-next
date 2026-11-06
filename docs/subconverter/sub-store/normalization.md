# 参数归一化与缺省值

## VMess security

依据：[vmess-security.js](https://github.com/sub-store-org/Sub-Store/blob/352f01b7091c99f4e219c44e4ec96f3288059843/backend/src/core/proxy-utils/vmess-security.js)。下表定义共享 helper 的完整显式枚举与别名；不能将某个目标的输出值误当作原输入字段的默认值。

| 目标 / 函数                   | 输入字段类型            | 可识别值                                         | 别名                                       | 缺省 / 无效值回落                      | 实际输出转换                                  |
| ----------------------------- | ----------------------- | ------------------------------------------------ | ------------------------------------------ | -------------------------------------- | --------------------------------------------- |
| normalizeVmessSecurity        | String 或可字符串化输入 | auto、none、zero、aes-128-gcm、chacha20-poly1305 | chacha20-ietf-poly1305 → chacha20-poly1305 | auto                                   | trim、小写、别名归一                          |
| normalizeClashVmessSecurity   | 同上                    | auto、aes-128-gcm、chacha20-poly1305、none       | 同上                                       | auto                                   | zero 不在该集合，回落 auto                    |
| formatQXVmessMethod           | 同上                    | none、chacha20-poly1305                          | 同上                                       | chacha20-poly1305                      | 输出 QX method                                |
| formatLoonVmessSecurity       | 同上                    | 使用 Clash 集合                                  | 同上                                       | auto                                   | chacha20-poly1305 改为 chacha20-ietf-poly1305 |
| formatSurgeVmessEncryptMethod | 同上                    | aes-128-gcm、chacha20-poly1305                   | 同上                                       | 未识别/缺省归一为 auto，最终不输出字段 | chacha20-poly1305 改为 chacha20-ietf-poly1305 |

## 输入存在性与插件 mux

依据：[producer utils.js](https://github.com/sub-store-org/Sub-Store/blob/352f01b7091c99f4e219c44e4ec96f3288059843/backend/src/core/proxy-utils/producers/utils.js)。

| 规则                           | 输入类型                      | 完整处理                                                  |
| ------------------------------ | ----------------------------- | --------------------------------------------------------- |
| isPresent                      | JSONValue                     | 仅 undefined/null 视为缺失；false、0、空 String 均为存在  |
| normalizePluginMuxValue        | Boolean                       | 转 Number 0/1                                             |
| normalizePluginMuxValue        | String                        | trim、小写；true/false 转 1/0；纯数字转整数；其他原值返回 |
| normalizePluginMuxValue        | 其他                          | 原值返回                                                  |
| normalizePluginMuxBooleanValue | 上述所有类型                  | 先 normalizePluginMuxValue，再进行 Boolean 转换           |
| produceProxyListOutput         | 数组 + internal 模式          | 返回数组本身                                              |
| produceProxyListOutput         | 数组 + prettyYaml/pretty-yaml | YAML safeDump 后格式归一化                                |
| produceProxyListOutput         | 数组 + 默认外部模式           | proxies 根键 + 每项 JSON flow mapping，仍是 YAML          |
