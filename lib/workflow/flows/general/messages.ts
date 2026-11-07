import { messages as fieldInput } from './field-input-node/i18n';
import { messages as httpRequest } from './http-request-node/i18n';
import { errorMessages as httpRequestErrors } from './http-request-node/i18n/errors';
import { messages as httpResponseHeaders } from './http-response-headers-node/i18n';
import { errorMessages as httpResponseHeadersErrors } from './http-response-headers-node/i18n/errors';
import { messages as merge } from './merge-node/i18n';

export const messages = {
  en: {
    fieldInput: fieldInput['en'],
    httpRequest: httpRequest['en'],
    httpResponseHeaders: httpResponseHeaders['en'],
    merge: merge['en'],
  },
  'zh-CN': {
    fieldInput: fieldInput['zh-CN'],
    httpRequest: httpRequest['zh-CN'],
    httpResponseHeaders: httpResponseHeaders['zh-CN'],
    merge: merge['zh-CN'],
  },
};

export const errorMessages = {
  en: { ...httpRequestErrors.en, ...httpResponseHeadersErrors.en },
  'zh-CN': { ...httpRequestErrors['zh-CN'], ...httpResponseHeadersErrors['zh-CN'] },
};
