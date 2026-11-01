import type { RuleSetEntry } from '../../types/ruleset';

export function parse(_content: string): RuleSetEntry[] {
  throw new Error('Sharing subscriptions do not support rulesets');
}

export function format(_entries: RuleSetEntry[]): never {
  throw new Error('Sharing subscriptions do not support rulesets');
}
