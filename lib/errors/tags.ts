export const codes = {
  NOT_FOUND: 1201000,
} as const;

export const messages = {
  'zh-CN': {
    NOT_FOUND: '标签不存在',
  },
  en: {
    NOT_FOUND: 'The tag does not exist.',
  },
} satisfies Record<'zh-CN' | 'en', Record<keyof typeof codes, string>>;
