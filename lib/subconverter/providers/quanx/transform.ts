import type { QuanXConfig, QuanXNode } from '../../types/quanx';
import { canonicalType, createIniTransform, extract as extractIni } from '../ini/transform';

export const supports = ['ss', 'ssr', 'vmess', 'vless', 'trojan', 'http', 'https', 'socks5', 'anytls'] as const;

export const transform = createIniTransform('quanx', 'quanx', supports);

export function extract(config: QuanXConfig): QuanXNode[] {
  return extractIni(config).filter((node) => supports.some((type) => type === canonicalType(node)));
}
