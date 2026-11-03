import { messages as common } from './common/i18n';
import { messages as configuration } from './configuration/i18n';
import { messages as subscription } from './subscription/i18n';

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
