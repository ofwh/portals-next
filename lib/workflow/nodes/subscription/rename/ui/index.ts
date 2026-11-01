import { RenameForm } from './config';
import { RenameContent, RenameIcon } from './view';
import { defineNodeView } from '../../../core/views';
import { definition } from '../model/definition';
import type { RenameConfig } from '../model/types';

export const renameNodeView = defineNodeView<RenameConfig>({
  type: definition.type,
  icon: RenameIcon,
  config: { Form: RenameForm },
  display: { size: { width: 260, height: 108 }, Content: RenameContent },
});
