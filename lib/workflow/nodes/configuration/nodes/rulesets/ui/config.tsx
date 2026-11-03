'use client';

import { ConfigurationTypeForm } from '@/components/app/application/subscriptions/workflow/configuration-type-form';
import type { NodeFormProps } from '@/lib/workflow/nodes/types';
import type { RuleGroupsConfig } from '../model/types';

export function RuleGroupsForm({ value, onChange, disabled, issues }: NodeFormProps<RuleGroupsConfig>) {
  return (
    <ConfigurationTypeForm
      value={value.type ?? 'ini'}
      onChange={(type) => onChange({ ...value, type })}
      disabled={disabled}
      issues={issues}
    />
  );
}
