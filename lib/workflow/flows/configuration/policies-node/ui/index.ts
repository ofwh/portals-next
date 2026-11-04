import { Network } from 'lucide-react';
import { defineNodeView } from '@/lib/workflow/node/core/views';
import { PolicyGroupsForm } from './config';
import { definition } from '../model/definition';
import type { PolicyGroupsConfig } from '../model/types';

export const policyGroupsNodeView = defineNodeView<PolicyGroupsConfig>({
  type: definition.type,
  config: { Form: PolicyGroupsForm },
  icon: Network,
});
