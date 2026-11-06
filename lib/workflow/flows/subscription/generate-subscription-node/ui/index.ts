import { defineNodeView } from '@/lib/workflow/node/core/views';
import { GenerateSubscriptionForm } from './config';
import { GenerateSubscriptionContent, GenerateSubscriptionIcon } from './view';
import { definition } from '../model/definition';
import type { GenerateSubscriptionConfig } from '../model/types';

export const generateSubscriptionNodeView = defineNodeView<GenerateSubscriptionConfig>({
  type: definition.type,
  icon: GenerateSubscriptionIcon,
  config: { Form: GenerateSubscriptionForm },
  display: { size: { width: 260, height: 108 }, Content: GenerateSubscriptionContent },
});
