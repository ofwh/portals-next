import type { RuleSetEntry } from '../../types/ruleset';
import { format as formatText, parse as parseText } from '../text-ruleset';

export function parse(content: string): RuleSetEntry[] {
  return parseText(content.split(/\r?\n/));
}

export function format(entries: RuleSetEntry[]): string[] {
  return formatText(entries);
}
