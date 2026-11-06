export const codes = {
  NOT_FOUND: 1401000,
  PATH_EXIST: 1401001,
  WORKFLOW_NOT_SAVED: 1401002,
  GENERATOR_REQUIRED: 1401003,
  ROUTE_NOT_FOUND: 1401004,
  ROUTE_CONFIG_ERROR: 1401005,
  ROUTE_SERVICE_ERROR: 1401006,
} as const;

export const messages = {
  'zh-CN': {
    NOT_FOUND: '订阅不存在',
    PATH_EXIST: '路由地址已被占用',
    WORKFLOW_NOT_SAVED: '订阅工作流尚未保存，请先在工作流页面保存',
    GENERATOR_REQUIRED: '订阅工作流必须包含且仅包含一个订阅生成节点',
    ROUTE_NOT_FOUND: '路由不存在',
    ROUTE_CONFIG_ERROR: '数据异常',
    ROUTE_SERVICE_ERROR: '无法处理请求',
  },
  en: {
    NOT_FOUND: 'Subscription does not exist.',
    PATH_EXIST: 'The pathname is already in use.',
    WORKFLOW_NOT_SAVED: 'The subscription workflow has not been saved. Save it on the workflow page first.',
    GENERATOR_REQUIRED: 'The subscription workflow must contain exactly one subscription generation node.',
    ROUTE_NOT_FOUND: 'Route not found.',
    ROUTE_CONFIG_ERROR: 'Invalid data.',
    ROUTE_SERVICE_ERROR: 'Unable to process request.',
  },
} satisfies Record<'zh-CN' | 'en', Record<keyof typeof codes, string>>;
