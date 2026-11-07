# 分组配置

输入为配置文本、`format` 和 `resolver`。格式读取器只抽取以下字段，产出带来源位置的有序条目。分组 resolver 处理条目内部语法并返回 `ProxyGroup[]`。

分组解析器放在分组配置模块的 `resolvers` 子目录（`lib/subscription/policy/resolvers`），按解析类别组织实现。

| 格式 | 路径                                     | 条目形态         |
| ---- | ---------------------------------------- | ---------------- |
| INI  | `[custom]` 下重复的 `custom_proxy_group` | 反引号分隔字符串 |
| YAML | `custom.proxy_groups`                    | 对象序列         |
| TOML | 根级 `[[custom_groups]]`                 | 表数组           |

[三个示例](/Users/larify/Documents/github/SubConverter-Extended/base/config)含导入示例。新入口遇到 `!!import:` 或对象中的 `import` 时返回该项的诊断，调用层可决定是否接受剩余条目。INI 重复项保持原顺序。YAML 旧字段 `custom_proxy_group` 可由兼容入口迁移。分组只产生声明、成员选择器和健康检查选项。成员筛选及引用检查由编译模块执行。

源码入口为 [settings.cpp](/Users/larify/Documents/github/SubConverter-Extended/src/handler/settings.cpp:2130) 与 [binding.h](/Users/larify/Documents/github/SubConverter-Extended/src/config/binding.h)。详细 resolver 和验收见[分组解析器](resolvers.md)。
