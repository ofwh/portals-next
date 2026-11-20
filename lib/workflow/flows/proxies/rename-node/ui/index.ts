import { defineNodeView } from '@/lib/workflow/node/core/views';
import { useNodeConfig } from './config';
import { RenameContent, RenameIcon } from './view';
import { definition } from '../model/definition';
import { validateConfig } from '../model/schema';
import type { RenameConfig } from '../model/types';

export const renameNodeView = defineNodeView<RenameConfig>({
  type: definition.type,
  icon: RenameIcon,
  config: { useNodeConfig, validate: validateConfig },
  display: { size: { width: 260, height: 108 }, Content: RenameContent },
});
