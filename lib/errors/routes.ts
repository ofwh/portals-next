export const codes = {
  INVALID_PATHNAME: 1001000,
  PROXY_NOT_FOUND: 1002000,
  PROXY_PATH_EXIST: 1002001,
  REDIRECT_NOT_FOUND: 1003000,
  REDIRECT_PATH_EXIST: 1003001,
  CACHE_NOT_FOUND: 1004000,
  CACHE_PATH_EXIST: 1004001,
  ORIGINAL_NOT_FOUND: 1005000,
  ORIGINAL_PATH_EXIST: 1005001,
} as const;

export const messages = {
  'zh-CN': {
    INVALID_PATHNAME: '路径不得包含空白、查询参数或片段',
    PROXY_NOT_FOUND: '代理路由不存在',
    PROXY_PATH_EXIST: '代理路由路径已被占用',
    REDIRECT_NOT_FOUND: '重定向路由不存在',
    REDIRECT_PATH_EXIST: '重定向路由路径已被占用',
    CACHE_NOT_FOUND: '缓存路由不存在',
    CACHE_PATH_EXIST: '缓存路由路径已被占用',
    ORIGINAL_NOT_FOUND: '静态内容路由不存在',
    ORIGINAL_PATH_EXIST: '静态内容路由路径已被占用',
  },
  en: {
    INVALID_PATHNAME: 'The path must not contain whitespace, query parameters, or fragments.',
    PROXY_NOT_FOUND: 'Proxy route does not exist.',
    PROXY_PATH_EXIST: 'The proxy route path is already in use.',
    REDIRECT_NOT_FOUND: 'Redirect route does not exist.',
    REDIRECT_PATH_EXIST: 'The redirect route path is already in use.',
    CACHE_NOT_FOUND: 'Cache route does not exist.',
    CACHE_PATH_EXIST: 'The cache route path is already in use.',
    ORIGINAL_NOT_FOUND: 'Original route does not exist.',
    ORIGINAL_PATH_EXIST: 'The original route path is already in use.',
  },
} satisfies Record<'zh-CN' | 'en', Record<keyof typeof codes, string>>;
