import type { SurfboardConfig } from '../../types/surfboard';
import { parseIni } from '../ini/parser';

export function parse(content: string): SurfboardConfig {
  return parseIni(content);
}
