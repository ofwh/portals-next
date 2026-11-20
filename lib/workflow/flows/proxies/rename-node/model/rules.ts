import { compilePattern } from '@/lib/shared/regex';
import type { RenameRule } from './types';

export function compileRules(rules: readonly RenameRule[]) {
  return rules.map((rule) => ({ regex: compilePattern(rule.pattern, 'g'), replacement: rule.replacement }));
}
