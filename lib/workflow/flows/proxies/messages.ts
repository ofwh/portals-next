import { messages as filter } from './filter-node/i18n';
import { messages as rename } from './rename-node/i18n';
import { messages as proxyList } from './resolve-node/i18n';

export const messages = {
  en: { proxyList: proxyList['en'], rename: rename['en'], filter: filter['en'] },
  'zh-CN': { proxyList: proxyList['zh-CN'], rename: rename['zh-CN'], filter: filter['zh-CN'] },
};
