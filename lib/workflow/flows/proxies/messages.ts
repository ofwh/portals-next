import { messages as filter } from './filter-node/i18n';
import { messages as merge } from './merge-node/i18n';
import { messages as rename } from './rename-node/i18n';
import { messages as proxyList } from './resolve-node/i18n';
import { messages as route } from './route-node/i18n';
import { errorMessages as routeErrors } from './route-node/i18n/errors';

export const messages = {
  en: { route: route.en, proxyList: proxyList['en'], merge: merge['en'], rename: rename['en'], filter: filter['en'] },
  'zh-CN': {
    route: route['zh-CN'],
    proxyList: proxyList['zh-CN'],
    merge: merge['zh-CN'],
    rename: rename['zh-CN'],
    filter: filter['zh-CN'],
  },
};

export const errorMessages = routeErrors;
