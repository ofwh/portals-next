export const errorMessages = {
  en: {
    COMPILE_FAILED: 'Subscription compilation failed.',
    COMPILE_MULTIPLE_TEMPLATES: 'Only one template can be connected to the compilation node.',
    COMPILE_TEMPLATE_MISMATCH: 'The template format does not match the output type.',
    COMPILE_RESOURCE_FAILED: 'The rule resource could not be loaded for compilation.',

    TEMPLATE_PARSE_FAILED: 'Template parsing failed at line {line}, column {column}.',
    RULESET_PARSE_FAILED: 'Rule set parsing failed at line {line}.',
    POLICY_PARSE_FAILED: 'Policy set parsing failed at line {line}.',
  },
  'zh-CN': {
    COMPILE_FAILED: '订阅编译失败',
    COMPILE_MULTIPLE_TEMPLATES: '编译节点最多连接一个模板',
    COMPILE_TEMPLATE_MISMATCH: '模板格式与输出类型不匹配',
    COMPILE_RESOURCE_FAILED: '编译所需规则资源加载失败',

    TEMPLATE_PARSE_FAILED: '模板解析失败（第 {line} 行，第 {column} 列）',
    RULESET_PARSE_FAILED: '规则集解析失败（第 {line} 行）',
    POLICY_PARSE_FAILED: '策略集解析失败（第 {line} 行）',
  },
};
