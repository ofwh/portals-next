# Clash 输出差异

## 规则集缓存字段

13 个 provider 的地址、行为和更新间隔一致。应用显式输出 `format: yaml`，subconverter 省略 `format`，两端缓存路径不同。

| 规则集                  | 当前应用路径                                                        | subconverter 路径                       |
| ----------------------- | ------------------------------------------------------------------- | --------------------------------------- |
| `Direct`                | `./providers/Direct-classical-8e128fb083d9228c.yaml`                | `./providers/4407685761061664964.yaml`  |
| `Advertising_Classical` | `./providers/Advertising_Classical-classical-012361ff486a652a.yaml` | `./providers/10817565884882176546.yaml` |
| `PrivateTracker`        | `./providers/PrivateTracker-classical-6ae13d68d80cfbec.yaml`        | `./providers/6674686490682645380.yaml`  |
| `Apple_Classical`       | `./providers/Apple_Classical-classical-2e2fa7b30cd042be.yaml`       | `./providers/13746213766437714998.yaml` |
| `AI`                    | `./providers/AI-classical-988ef19f49365627.yaml`                    | `./providers/17789195773209377839.yaml` |
| `category-ai-!cn`       | `./providers/category-ai-_cn-classical-0374788cb63265a9.yaml`       | `./providers/7397532845648091185.yaml`  |
| `Microsoft`             | `./providers/Microsoft-classical-14e215b5df2f5adc.yaml`             | `./providers/2854968195646155156.yaml`  |
| `GitHub`                | `./providers/GitHub-classical-7811d778c81b8980.yaml`                | `./providers/13295610275586999576.yaml` |
| `YouTube`               | `./providers/YouTube-classical-67b7c531212f7080.yaml`               | `./providers/13556833394941809752.yaml` |
| `YouTubeMusic`          | `./providers/YouTubeMusic-classical-116b41398d64db26.yaml`          | `./providers/9242852522542077342.yaml`  |
| `Google`                | `./providers/Google-classical-402ca0596178a5d0.yaml`                | `./providers/13486856395495061512.yaml` |
| `Telegram`              | `./providers/Telegram-classical-d1420914f8cd0f78.yaml`              | `./providers/16203515868075700944.yaml` |
| `Global_Classical`      | `./providers/Global_Classical-classical-be6de8b1d71b5346.yaml`      | `./providers/11691874005223134014.yaml` |

[返回对比报告](../README.md)
