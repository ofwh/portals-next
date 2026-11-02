import type { LoonConfig } from '../../types/loon';
import { parseIni } from '../ini/parser';

export function parse(content: string): LoonConfig {
  return parseIni(content);
}
