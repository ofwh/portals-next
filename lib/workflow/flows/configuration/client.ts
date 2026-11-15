import { configDeclarationType } from '@/lib/sub/config/schema';
import { templateType } from '@/lib/sub/template/schema';
import type { TypeRegistry } from '@/lib/workflow/node/core/type-registry';
import type { NodeViewRegistry } from '@/lib/workflow/node/core/views';
import { compileNodeView } from './compile-node/client';
import { isConfig as isCompileConfig } from './compile-node/model/schema';
import { configResolveNodeView } from './config-node/client';
import { isConfig } from './config-node/model/schema';
import { templateResolveNodeView } from './template-node/client';
import { isConfig as isTemplateConfig } from './template-node/model/schema';

export function registerConfigurationViews(views: NodeViewRegistry, types: TypeRegistry): void {
  types.registerType(templateType);
  types.registerType(configDeclarationType);
  views.registerNodeView(compileNodeView, isCompileConfig);
  views.registerNodeView(templateResolveNodeView, isTemplateConfig);
  views.registerNodeView(configResolveNodeView, isConfig);
}
