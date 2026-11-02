import type { SurfboardConfig, SurfboardNode } from '../../types/surfboard';
import { canonicalType, createIniTransform, extract as extractIni } from '../ini/transform';

export const supports = ['ss', 'vmess', 'socks5', 'http', 'https', 'trojan'] as const;

export const transform = createIniTransform('surfboard', 'surge', supports);

export function extract(config: SurfboardConfig): SurfboardNode[] {
  return extractIni(config).filter((node) => supports.some((type) => type === canonicalType(node)));
}
