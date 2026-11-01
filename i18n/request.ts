import { getRequestConfig } from 'next-intl/server';
import { getRequestPreferences } from '@/lib/preferences/server';
import { languageMessages, mergeMessages } from './config';

export default getRequestConfig(async () => {
  const { language: locale } = await getRequestPreferences();

  return {
    locale,
    messages: mergeMessages(languageMessages.en, languageMessages[locale]),
  };
});
