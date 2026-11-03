'use client';

import { ConfigurationTypeForm } from '@/components/app/application/subscriptions/workflow/configuration-type-form';
import type { NodeFormProps } from '@/lib/workflow/nodes/types';
import type { PolicyGroupsConfig } from '../model/types';

export function PolicyGroupsForm({ value, onChange, disabled, issues }: NodeFormProps<PolicyGroupsConfig>) {
  return (
    <ConfigurationTypeForm
      value={value.type ?? 'ini'}
      onChange={(type) => onChange({ ...value, type })}
      disabled={disabled}
      issues={issues}
    />
  );
}
