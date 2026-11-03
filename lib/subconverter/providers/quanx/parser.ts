import type { QuanXConfig } from '../../types/providers/quanx';
import { parseIni } from '../ini/parser';

export function parse(content: string): QuanXConfig {
  return parseIni(content, true);
}
