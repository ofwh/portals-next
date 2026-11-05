# V2Ray（Base64 链接订阅） 输出类型

依据：[v2ray.js](https://github.com/sub-store-org/Sub-Store/blob/352f01b7091c99f4e219c44e4ec96f3288059843/backend/src/core/proxy-utils/producers/v2ray.js)。表格的类型和缺省语义遵守[阅读约定](README.md#阅读约定)。

## schema

String：Base64(UTF-8(URI 行以 LF 拼接))。

```text
c3M6Ly9ZV1Z6TFRFeU9DMW5ZMjA2YzJWamNtVjBAcHJveHkuZXhhbXBsZS5jb206NDQzP3VkcD0xI0V4YW1wbGU=
```

上例解码后为一条完整 SS URI；包含多条节点时以 LF 分隔后统一编码。

## 参数

全部显式字段、嵌套路径、私有输入、删除规则、枚举及动态参数见[逐参数全表](parameters/v2ray.md)。以下表格解释主要字段的协议语义；共享字段通过公共表完整维护。

| 节点 / 范围  | 字段       | 类型     | 默认值 / 缺省行为       | 必须           | 选项 / 约束 | 示例       | 映射说明                                          |
| ------------ | ---------- | -------- | ----------------------- | -------------- | ----------- | ---------- | ------------------------------------------------- |
| 所有节点     | `内层 URI` | `String` | 调用 URI.produce(proxy) | 每个可表达节点 | 未限定      | —          | 全部字段、默认值、编码与约束见 [URI 参数](uri.md) |
| 订阅         | `行分隔`   | `String` | LF                      | 否             | 未限定      | `\n`       | 按输入条件输出                                    |
| 订阅         | `外层编码` | `String` | 标准 Base64             | 是             | 未限定      | `c3M6Ly8…` | 按输入条件输出                                    |
| 转换失败节点 | `产物`     | `不追加` | catch 后记录错误        | 否             | 未限定      | —          | URI 返回空串不等同于抛异常；需区分                |

## 能力与约束

V2Ray 在此是包装 producer 名称，不表示仅含 VMess，也不是 V2Ray 完整 JSON 配置。它不因编码为 Base64 而移除 URI 的 udp/uot/tfo 参数。
