import type { QuanXConfig } from '../../types/quanx';
import { parseIni } from '../ini/parser';

export function parse(content: string): QuanXConfig {
  return parseIni(content, true);
}
