import * as routes from './routes';
import * as shortcuts from './shortcuts';
import * as subscriptions from './subscriptions';
import * as tags from './tags';
import * as workflow from './workflow';

export const BUSINESS_ERROR_CODE = {
  routes: routes.codes,
  shortcuts: shortcuts.codes,
  tags: tags.codes,
  subscriptions: subscriptions.codes,
  workflow: workflow.codes,
} as const;

type Codes = typeof BUSINESS_ERROR_CODE;

export type BusinessErrorCode = {
  [Namespace in keyof Codes]: `${Namespace}.${keyof Codes[Namespace] & string}`;
}[keyof Codes];

export const BUSINESS_MESSAGES = {
  'zh-CN': {
    routes: routes.messages['zh-CN'],
    shortcuts: shortcuts.messages['zh-CN'],
    tags: tags.messages['zh-CN'],
    subscriptions: subscriptions.messages['zh-CN'],
    workflow: workflow.messages['zh-CN'],
  },
  en: {
    routes: routes.messages.en,
    shortcuts: shortcuts.messages.en,
    tags: tags.messages.en,
    subscriptions: subscriptions.messages.en,
    workflow: workflow.messages.en,
  },
};
