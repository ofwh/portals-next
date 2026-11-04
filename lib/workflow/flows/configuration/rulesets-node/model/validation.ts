import type { RuleGroupFields } from '@/lib/subconverter/types/rulesets';
import type { RulesetIssue } from './fields-types';

export function validateRuleGroup(value: RuleGroupFields): RulesetIssue[] {
  const issues: RulesetIssue[] = [];

  if (!Number.isSafeInteger(value.interval) || value.interval < 0) {
    issues.push({ path: ['interval'], code: 'integer' });
  }

  if (!value.policy.trim()) {
    issues.push({ path: ['policy'], code: 'required' });
  }

  if (value.type === 'inline' && !value.rule.trim()) {
    issues.push({ path: ['rule'], code: 'required' });
  }

  if (value.type === 'remote' && !value.url.trim()) {
    issues.push({ path: ['url'], code: 'required' });
  }

  return issues;
}
