import en from './en.json';
import zhCN from './zh-CN.json';
import { messages as common } from '../general/messages';
import { messages as proxy } from '../proxies/messages';

export const messages = {
  en: { workflowNodes: { groups: en, common: common.en, proxy: proxy.en } },
  'zh-CN': { workflowNodes: { groups: zhCN, common: common['zh-CN'], proxy: proxy['zh-CN'] } },
};
