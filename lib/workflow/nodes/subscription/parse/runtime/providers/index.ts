import { clashProvider } from './clash';
import { linksProvider } from './links';
import { singBoxProvider } from './sing-box';
import type { FormatParser } from './types';
import type { SubscriptionFormat } from '../../model/types';

export const formatParsers = {
  'sing-box': singBoxProvider,
  clash: clashProvider,
  links: linksProvider,
} satisfies Record<Exclude<SubscriptionFormat, 'auto' | 'base64'>, FormatParser>;
