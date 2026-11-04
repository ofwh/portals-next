import { ListFilter } from 'lucide-react';
import { defineNodeView } from '@/lib/workflow/node/core/views';
import { RuleGroupsForm } from './config';
import { definition } from '../model/definition';
import type { RuleGroupsConfig } from '../model/types';

export const ruleGroupsNodeView = defineNodeView<RuleGroupsConfig>({
  type: definition.type,
  config: { Form: RuleGroupsForm },
  icon: ListFilter,
});
