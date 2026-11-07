import { ListChecks } from 'lucide-react';
import { defineNodeView } from '@/lib/workflow/node/core/views';
import { useNodeConfig } from './config';
import { definition } from '../model/definition';
import { validateConfig } from '../model/schema';
import type { RulesetResolveConfig } from '../model/types';

export const rulesetResolveNodeView = defineNodeView<RulesetResolveConfig>({
  type: definition.type,
  icon: ListChecks,
  config: { useNodeConfig, validate: validateConfig },
});
