import { nanoid } from 'nanoid';
import { compilePattern } from '@/lib/shared/regex';
import type { RenameRule } from './types';

export function compileRules(rules: readonly RenameRule[]) {
  return rules.map((rule) => ({ regex: compilePattern(rule.pattern, 'g'), replacement: rule.replacement }));
}

export function applyRules(name: string, rules: ReturnType<typeof compileRules>): string {
  for (const rule of rules) {
    name = name.replace(rule.regex, rule.replacement);
  }

  return name.trim() ? name : nanoid();
}
