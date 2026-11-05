# JSON（规范化内部节点） 输出类型

依据：[index.js](https://github.com/sub-store-org/Sub-Store/blob/352f01b7091c99f4e219c44e4ec96f3288059843/backend/src/core/proxy-utils/producers/index.js)。表格的类型和缺省语义遵守[阅读约定](README.md#阅读约定)。

## schema

JSON Array：

```json
[
  {
    "type": "ss",
    "name": "Example",
    "server": "proxy.example.com",
    "port": 443,
    "cipher": "aes-128-gcm",
    "password": "secret",
    "udp": true
  }
]
```

## 参数

全部显式字段、嵌套路径、私有输入、删除规则、枚举及动态参数见[逐参数全表](parameters/index.md)。以下表格解释主要字段的协议语义；共享字段通过公共表完整维护。

| 节点 / 范围   | 字段       | 类型            | 默认值 / 缺省行为  | 必须 | 选项 / 约束 | 示例 | 映射说明                                               |
| ------------- | ---------- | --------------- | ------------------ | ---- | ----------- | ---- | ------------------------------------------------------ |
| 全部节点      | `数组元素` | `Object`        | 不进行目标字段转换 | 是   | 未限定      | —    | 规范化输入节点按 JSON.stringify(proxies,null,2) 序列化 |
| 输入字段      | `原有键`   | `原 JSON 类型`  | 原值               | 否   | 未限定      | —    | 含内部结构；不是 sing-box 出站，也不是 YAML 包装       |
| internal 模式 | `返回值`   | `Array<Object>` | 直接返回原数组     | 否   | 未限定      | —    | 不是 String 输出                                       |

## 能力与约束

JSON producer 不承担客户端兼容过滤。共同字段见 [公共字段](common.md)，规范化协议字段见 [YAML 词汇表](yaml-fields.md)；不得以该透明序列化目标证明客户端接受这些字段。
