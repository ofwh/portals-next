import { errorMessages as configuration } from '../configuration/i18n/errors';
import { errorMessages as common } from '../general/messages';

export const errorMessages = {
  en: { ...common.en, ...configuration.en },
  'zh-CN': { ...common['zh-CN'], ...configuration['zh-CN'] },
};
