import type { SubscriptionTemplateFormat } from '../types/template';

export const templateFormats = [
  'clash',
  'surge',
  'surfboard',
  'quanx',
  'loon',
  'sssub',
  'singbox',
  'stash',
] as const satisfies readonly SubscriptionTemplateFormat[];

export function isTemplateFormat(value: unknown): value is SubscriptionTemplateFormat {
  return typeof value === 'string' && templateFormats.some((format) => format === value);
}
