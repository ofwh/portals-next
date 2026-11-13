# Surge 输出差异

## Apple服务动态策略字段

规则、模板设置及其余 15 个策略组一致。以下两行的静态成员相同，应用另外输出 `policy-path`、`policy-regex-filter` 和 `update-interval`。

当前应用

```ini
Apple服务 = select,DIRECT,代理访问,自动选择,香港节点,新加坡节点,日本节点,台湾节点,美国节点,其他节点,policy-path=https://p.bofoi.com/b/sub/sakura/ss,policy-regex-filter="港|HK|Hong Kong",update-interval=86400
```

subconverter

```ini
Apple服务 = select,DIRECT,代理访问,自动选择,香港节点,新加坡节点,日本节点,台湾节点,美国节点,其他节点
```

[返回对比报告](../README.md)
