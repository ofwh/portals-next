# 公共解析与诊断

提供接收文本的 INI、TOML、YAML、JSON 解析工具。输出保留值类型及可获得的源码位置；INI 保留重复键、声明顺序和无键行。封装底层异常与解析限制。模块可重用严格的 Base64、百分号解码和通用分行工具，具体协议字段的解释留在所属模块。

仓库可复用的起点包括 [INIReader](/Users/larify/Documents/github/SubConverter-Extended/src/utils/ini_reader/ini_reader.h)、[YAML 辅助](/Users/larify/Documents/github/SubConverter-Extended/src/utils/yamlcpp_extra.h)、[JSON 辅助](/Users/larify/Documents/github/SubConverter-Extended/src/utils/rapidjson_extra.h)和 [Base64](/Users/larify/Documents/github/SubConverter-Extended/src/utils/base64)。各模块自己提取路径、定义导入标记和业务默认值。公共工具不读取外部资源。设置资源大小、深度与条目上限，诊断包含模块、格式、位置、错误码和必要的字段名，避免返回敏感原文。

验收覆盖重复键、顺序、空文档、错位类型、过长输入和语法错误位置。
