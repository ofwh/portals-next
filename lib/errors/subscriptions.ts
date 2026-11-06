export const codes = {
  NOT_FOUND: 1401000,
  PATH_EXIST: 1401001,
} as const;

export const reservedCodes = [1401002, 1401003, 1401004, 1401005, 1401006] as const;

export const messages = {
  'zh-CN': {
    NOT_FOUND: '订阅不存在',
    PATH_EXIST: '路由地址已被占用',
  },
  en: {
    NOT_FOUND: 'Subscription does not exist.',
    PATH_EXIST: 'The pathname is already in use.',
  },
} satisfies Record<'zh-CN' | 'en', Record<keyof typeof codes, string>>;
