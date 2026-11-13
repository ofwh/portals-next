# sing-box 输出差异

## 路由规则与规则集

应用输出 14 条路由规则和 21 个规则集定义，subconverter 输出 16 条路由规则和 0 个定义。两端均保留模板的 `sniff` 与 `hijack-dns`。

| 检查项       | 当前应用                                                      | subconverter                                                                                 |
| ------------ | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 模式规则     | 无                                                            | `{"clash_mode":"Global","outbound":"GLOBAL"}`、`{"clash_mode":"Direct","outbound":"DIRECT"}` |
| 私有 IP      | `{"ip_is_private":true,"action":"route","outbound":"DIRECT"}` | `{"private":"true","outbound":"DIRECT"}`                                                     |
| 广告规则动作 | `action: reject`                                              | `outbound: REJECT`                                                                           |

| 策略          | 应用保留的全部标签                                            | subconverter 保留的标签    |
| ------------- | ------------------------------------------------------------- | -------------------------- |
| 拒绝          | `geosite-category-ads-all`、`personal-ad-block`               | `geosite-category-ads-all` |
| 手动选择      | `personal-proxy`、`personal-specify-proxy`、`geosite-18comic` | `personal-proxy`           |
| Google服务    | `geosite-youtube`、`geoip-google`、`geosite-google`           | `geosite-youtube`          |
| Telegram服务  | `geoip-telegram`、`geosite-telegram`                          | `geoip-telegram`           |
| Microsoft服务 | `geosite-microsoft`、`geosite-onedrive`                       | `geosite-microsoft`        |
| Netflix服务   | `geoip-netflix`、`geosite-netflix`                            | `geoip-netflix`            |
| Disney+服务   | `geoip-netflix`、`geosite-disney`                             | `geoip-netflix`            |
| DIRECT        | `personal-direct`、`geosite-cn`、`geoip-cn`                   | `personal-direct`          |

应用的 21 个规则集定义及两端完整路由规则见[机器可读统计](../comparison/results.json)。

## 策略组与最终出站

| 检查项                       | 当前应用                                                                                                                   | subconverter             |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 独有策略组                   | `手动选择`、`AI服务`、`Apple服务`、`Google服务`、`Telegram服务`、`Microsoft服务`、`Netflix服务`、`Disney+服务`、`规则之外` | `GLOBAL`                 |
| 共有组 `自动选择` 的间隔字段 | 省略 `interval`                                                                                                            | `interval: ""`           |
| `route.final`                | `规则之外`，存在同名出站                                                                                                   | `规则之外`，缺少同名出站 |

[返回对比报告](../README.md)
