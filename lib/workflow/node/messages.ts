import { messages as configuration } from '../flows/configuration/i18n';
import { messages as common } from '../flows/general/i18n';
import { messages as subscription } from '../flows/subscription/i18n';

export const nodeMessages = {
  en: { workflowNodes: { common: common.en, configuration: configuration.en, subscription: subscription.en } },
  'zh-CN': {
    workflowNodes: {
      common: common['zh-CN'],
      configuration: configuration['zh-CN'],
      subscription: subscription['zh-CN'],
    },
  },
};
