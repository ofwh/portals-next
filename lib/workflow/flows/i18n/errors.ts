import { errorMessages as configuration } from '../configuration/i18n/errors';
import { errorMessages as common } from '../general/messages';
import { errorMessages as proxy } from '../proxies/messages';

export const errorMessages = {
  en: { ...common.en, ...proxy.en, ...configuration.en },
  'zh-CN': { ...common['zh-CN'], ...proxy['zh-CN'], ...configuration['zh-CN'] },
};
