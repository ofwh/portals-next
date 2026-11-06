import type { SurgeConfig, SurgeNode } from '../../types/providers/surge';
import { canonicalType, createIniTransform, extract as extractIni } from '../ini/transform';

export const supports = [
  'ss',
  'vmess',
  'socks5',
  'http',
  'https',
  'trojan',
  'snell',
  'wireguard',
  'hysteria2',
  'tuic',
  'anytls',
] as const;

export const transform = createIniTransform('surge', 'surge', supports);

export function extract(config: SurgeConfig): SurgeNode[] {
  return extractIni(config).filter((node) => supports.some((type) => type === canonicalType(node)));
}
