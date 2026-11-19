export const codes = {
  NOT_FOUND: 1101000,
  PATH_EXIST: 1101001,
  TYPE_EXIST: 1101002,
} as const;

export const messages = {
  'zh-CN': {
    NOT_FOUND: '路由别名不存在',
    PATH_EXIST: '路由别名路径已被占用',
    TYPE_EXIST: '该路由类型的别名已存在',
  },
  en: {
    NOT_FOUND: 'The route alias does not exist.',
    PATH_EXIST: 'The route alias path is already in use.',
    TYPE_EXIST: 'An alias already exists for this route type.',
  },
} satisfies Record<'zh-CN' | 'en', Record<keyof typeof codes, string>>;
