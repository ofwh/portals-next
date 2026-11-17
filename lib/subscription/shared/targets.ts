import type { SubscriptionType, TemplateFormat } from '../types';

export const COMPILE_TARGETS = {
  mixed: { label: 'Mixed', format: 'uri' },
  clash: { label: 'Clash', format: 'yaml' },
  loon: { label: 'Loon', format: 'ini' },
  singbox: { label: 'sing-box', format: 'json' },
  quanx: { label: 'Quantumult X', format: 'ini' },
  surge: { label: 'Surge', format: 'ini' },
  surfboard: { label: 'Surfboard', format: 'ini' },
} as const satisfies Record<string, { label: string; format: 'uri' | TemplateFormat }>;

export const COMPILE_TARGET_OPTIONS = Object.entries(COMPILE_TARGETS).map(([value, { label }]) => ({
  value: value as SubscriptionType,
  label,
}));

export function isCompileTarget(value: unknown): value is SubscriptionType {
  return typeof value === 'string' && Object.hasOwn(COMPILE_TARGETS, value);
}
