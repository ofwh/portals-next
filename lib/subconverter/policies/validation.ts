import type { PolicyGroupIssue } from '@/lib/subconverter/policies/fields-types';
import type { PolicyGroupFields } from '@/lib/subconverter/types/policies';

export function validatePolicyGroup(value: PolicyGroupFields): PolicyGroupIssue[] {
  const issues: PolicyGroupIssue[] = [];

  if (!value.name.trim()) {
    issues.push({ path: ['name'], code: 'required' });
  }

  for (const field of ['interval', 'timeout', 'tolerance'] as const) {
    const number = value[field];

    if (number !== undefined && (!Number.isSafeInteger(number) || number < 0)) {
      issues.push({ path: [field], code: 'integer' });
    }
  }
  if (value.url) {
    try {
      const url = new URL(value.url);

      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        issues.push({ path: ['url'], code: 'httpUrl' });
      }
    } catch {
      issues.push({ path: ['url'], code: 'httpUrl' });
    }
  }

  value.members.forEach((member, index) => {
    if (!member.value.trim()) {
      issues.push({ path: ['members', index, 'value'], code: 'required' });
    }
  });
  value.providers.forEach((provider, index) => {
    if (!provider.trim()) {
      issues.push({ path: ['providers', index], code: 'required' });
    }
  });

  return issues;
}
