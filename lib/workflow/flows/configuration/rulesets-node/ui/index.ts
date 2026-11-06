import { ListFilter } from 'lucide-react';
import { defineNodeView } from '@/lib/workflow/node/core/views';
import { RuleGroupsForm } from './config';
import { definition } from '../model/definition';
import { validateConfig } from '../model/schema';
import type { RuleGroupsConfig } from '../model/types';

export const ruleGroupsNodeView = defineNodeView<RuleGroupsConfig>({
  type: definition.type,
  config: { validate: validateConfig, Form: RuleGroupsForm },
  icon: ListFilter,
});
