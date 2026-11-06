import type { SurfboardConfig, SurfboardNode } from '../../types/providers/surfboard';
import { canonicalType, createIniTransform, extract as extractIni } from '../ini/transform';

export const supports = [
  'ss',
  'vmess',
  'socks5',
  'http',
  'https',
  'trojan',
  'snell',
  'tuic',
  'hysteria2',
  'anytls',
] as const;

export const transform = createIniTransform('surfboard', 'surge', supports);

export function extract(config: SurfboardConfig): SurfboardNode[] {
  return extractIni(config).filter((node) => supports.some((type) => type === canonicalType(node)));
}
