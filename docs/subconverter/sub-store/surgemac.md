# SurgeMac 输出类型

依据：[surgemac.js](https://github.com/sub-store-org/Sub-Store/blob/352f01b7091c99f4e219c44e4ec96f3288059843/backend/src/core/proxy-utils/producers/surgemac.js)。表格的类型和缺省语义遵守[阅读约定](README.md#阅读约定)。

## schema

String 节点行。原生分支继承 Surge；external 分支：

```ini
Example=external,exec="/usr/local/bin/mihomo",local-port=1080,args="-f",args="/tmp/config.yaml"
```

## 参数

全部显式字段、嵌套路径、私有输入、删除规则、枚举及动态参数见[逐参数全表](parameters/surgemac.md)。以下表格解释主要字段的协议语义；共享字段通过公共表完整维护。

| 节点 / 范围 | 字段                               | 类型                | 默认值 / 缺省行为   | 必须             | 选项 / 约束 | 示例                                | 映射说明                                 |
| ----------- | ---------------------------------- | ------------------- | ------------------- | ---------------- | ----------- | ----------------------------------- | ---------------------------------------- |
| 原生节点    | `参数集合`                         | `Surge 原生类型`    | 继承 Surge producer | 否               | 未限定      | —                                   | 见 [Surge 参数](surge.md)，不重复定义    |
| External    | `exec`                             | `String`            | 未声明              | 是：源码显式检查 | 未限定      | `/usr/local/bin/mihomo`             | 按输入条件输出                           |
| External    | `local-port`                       | `Number 文本`       | 未声明              | 是：源码显式检查 | 未限定      | `1080`                              | 按输入条件输出                           |
| External    | `args`                             | `重复 String 参数`  | 来源数组逐项输出    | 否               | 未限定      | `args="-f",args="/tmp/config.yaml"` | 按输入条件输出                           |
| External    | `addresses`                        | `String / 数组投影` | 按来源              | 否               | 未限定      | `proxy.example.com`                 | 按输入条件输出                           |
| Mihomo 回退 | `mihomoExternal / _mihomoExternal` | `Boolean 生产选项`  | 未启用              | 否               | 未限定      | `true`                              | 不是线格式节点参数                       |
| Mihomo 回退 | `useMihomoExternal`                | `Boolean 生产选项`  | 未启用              | 否               | 未限定      | `true`                              | 仅捕获 SurgeUnsupportedProxyError 后回退 |

## 能力与约束

SurgeMac 是原生 Surge producer 加 external 能力；不代表输出内容变为 Mihomo YAML。External 运行命令、端口和附件配置构成完整部署依赖，单条节点行不能替代附件。
