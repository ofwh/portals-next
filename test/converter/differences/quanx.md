# Quantumult X 输出差异

## 本地规则

18 条规则中，以下 6 条文本有差异。

| 行  | 当前应用                                                      | subconverter                                  |
| --- | ------------------------------------------------------------- | --------------------------------------------- |
| 1   | `HOST-SUFFIX,local,direct`                                    | `DOMAIN-SUFFIX,local,direct`                  |
| 2   | `HOST-SUFFIX,googleapis.com,Microsoft服务,force-cellular`     | `DOMAIN-SUFFIX, googleapis.com,Microsoft服务` |
| 3   | `HOST-SUFFIX,googleapis.com,直连访问,multi-interface`         | `DOMAIN-SUFFIX, googleapis.com,直连访问`      |
| 4   | `HOST-SUFFIX,googleapis.com,代理访问,multi-interface-balance` | `DOMAIN-SUFFIX, googleapis.com,代理访问`      |
| 15  | `IP6-CIDR,fc00::/7,direct`                                    | `IP-CIDR6,fc00::/7,direct`                    |
| 16  | `IP6-CIDR,fe80::/10,direct`                                   | `IP-CIDR6,fe80::/10,direct`                   |

## 测速组成员

7 个测速组由应用保留 `server-tag-regex`，subconverter 生成静态成员列表。其余 10 个组逐行一致。

| 组         | 应用的 `server-tag-regex`                                                                                                                                              | subconverter 静态成员数 |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| 自动选择   | `(香港\|新加坡\|美国\|日本\|台湾\|港\|台\|新\|狮\|獅\|美\|日\|HK\|hk\|HongKong\|hongkong\|SG\|Singapore\|US\|States\|American\|JP\|Japan\|TW\|Taiwan)`                 | 112                     |
| 香港优选   | `(港\|HK\|hk\|HongKong\|hongkong)`                                                                                                                                     | 26                      |
| 美国优选   | `(美\|US\|us\|States\|American)`                                                                                                                                       | 23                      |
| 新加坡优选 | `(新\|狮\|獅\|SG\|sg\|Singapore)`                                                                                                                                      | 21                      |
| 日本优选   | `(日\|JP\|jp\|Japan)`                                                                                                                                                  | 26                      |
| 台湾优选   | `(台\|TW\|tw\|Taiwan)`                                                                                                                                                 | 16                      |
| 其他优选   | `(?=.*)^((?!(香港\|新加坡\|美国\|日本\|台湾\|港\|台\|新\|狮\|獅\|美\|日\|HK\|hk\|HongKong\|hongkong\|SG\|Singapore\|US\|States\|American\|JP\|Japan\|TW\|Taiwan)).)*$` | 79                      |

## DNS 模板

9 条 DNS 设置按值及顺序一致，差异为等号两侧空格。

## 节点 UDP 字段

应用有 90 个节点显式输出 `udp-relay=true`，subconverter 没有显式输出该值。

[返回对比报告](../README.md)
