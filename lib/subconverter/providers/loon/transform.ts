import type { LoonConfig, LoonNode } from '../../types/providers/loon';
import { canonicalType, createIniTransform, extract as extractIni } from '../ini/transform';

export const supports = [
  'ss',
  'ssr',
  'vmess',
  'vless',
  'trojan',
  'http',
  'https',
  'socks5',
  'wireguard',
  'hysteria2',
  'anytls',
] as const;

export const transform = createIniTransform('loon', 'loon', supports);

export function extract(config: LoonConfig): LoonNode[] {
  return extractIni(config).filter((node) => supports.some((type) => type === canonicalType(node)));
}
