# Surfboard 输出差异

## 远程规则引用

应用保留以下 13 条原始引用，subconverter 的 `[Rule]` 仅含 3 条本地规则。两端的本地规则、`[General]` 和 16 个策略组一致。

```ini
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Direct/Direct.yaml,直连访问,update-interval=86400
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Advertising/Advertising_Classical.yaml,禁止访问,update-interval=86400
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/PrivateTracker/PrivateTracker.yaml,禁止访问,update-interval=86400
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Apple/Apple_Classical.yaml,Apple服务,update-interval=86400
RULE-SET,https://raw.githubusercontent.com/ofwh/Profiles/main/Clash/Rules/Proxy/AI.yaml,AI服务,update-interval=86400
RULE-SET,https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/refs/heads/meta/geo/geosite/category-ai-!cn.yaml,AI服务,update-interval=86400
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Microsoft/Microsoft.yaml,Microsoft服务,update-interval=86400
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/GitHub/GitHub.yaml,Microsoft服务,update-interval=86400
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/YouTube/YouTube.yaml,Google服务,update-interval=86400
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/YouTubeMusic/YouTubeMusic.yaml,Google服务,update-interval=86400
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Google/Google.yaml,Google服务,update-interval=86400
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Telegram/Telegram.yaml,Telegram服务,update-interval=86400
RULE-SET,https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Global/Global_Classical.yaml,规则之外,update-interval=86400
```

[返回对比报告](../README.md)
