import type { SurgeConfig } from '../../types/providers/surge';
import { parseIni } from '../ini/parser';

export function parse(content: string): SurgeConfig {
  return parseIni(content);
}
