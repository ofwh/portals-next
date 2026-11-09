# 模板配置

输入为模板文本与显式格式，输出为带格式标记的 `Template<T>`。首批格式为 YAML、JSON，若继续支持现有 INI 目标则接入 INI 文档适配器。模块只做语法解析和存储。目标必需的根节点形状、节点/分组/规则字段、默认模板及复制合并属于编译驱动。

格式驱动放在模板配置模块的 `drivers` 子目录（`lib/subscription/template/drivers`）。YAML/JSON 使用公共解析器并保留原值类型和结构。INI 驱动保留节、重复条目、无键行及原始条目文本；未覆盖的条目不得因序列化引入分隔符空白。模板对象由调用方持有，可被多个编译请求复用。语法错误带位置返回，空模板是否允许由编译目标声明。若目标必须保留注释、排序或 YAML 标量样式，选择能承载该信息的文档类型，并在目标序列化时处理。

现有入口在 [interfaces.cpp](/Users/larify/Documents/github/SubConverter-Extended/src/handler/interfaces.cpp:6633) 按目标调用 renderBase， [templates.cpp](/Users/larify/Documents/github/SubConverter-Extended/src/generator/template/templates.cpp) 负责 Inja 渲染。迁移由调用层先提供已渲染文本，解析模块直接接收结果。旧目标内置的空模板回退在驱动层对照确认。

验收覆盖 YAML/JSON 嵌套键、未知字段、非法文档、INI 重复项与无键行。同一模板被多个请求使用时，任一请求的合并结果不得污染其他请求。
