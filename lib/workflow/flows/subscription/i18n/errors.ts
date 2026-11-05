export const errorMessages = {
  'zh-CN': {
    SUBSCRIPTION_TEMPLATE_DUPLICATE: '订阅生成节点只能接入一个模板',
    SUBSCRIPTION_TEMPLATE_PARSE_FAILED: '模板解析失败，请检查 {format} 模板内容及所选类型',
    SUBSCRIPTION_GENERATE_FAILED: '订阅类型 {target} 生成失败：{stageZh}，{positionZh}，{reasonZh}',
    SUBSCRIPTION_PARSE_FAILED: '订阅解析失败，未发现有效的受支持节点，请检查格式、协议及必填字段',
    SUBSCRIPTION_EMPTY_NAME: '重命名后的节点名称不能为空',
  },
  en: {
    SUBSCRIPTION_TEMPLATE_DUPLICATE: 'A subscription generation node accepts only one template.',
    SUBSCRIPTION_TEMPLATE_PARSE_FAILED:
      'Template parsing failed. Check the {format} template content and selected type.',
    SUBSCRIPTION_GENERATE_FAILED: 'Subscription type {target} generation failed: {stageEn}, {positionEn}, {reasonEn}',
    SUBSCRIPTION_PARSE_FAILED:
      'Subscription parsing failed. No valid supported nodes were found. Check the format, protocols, and required fields.',
    SUBSCRIPTION_EMPTY_NAME: 'Renamed subscription nodes must have a non-empty name.',
  },
};
