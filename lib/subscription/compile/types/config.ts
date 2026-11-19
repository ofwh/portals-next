import type { CompiledNode } from './compile';
import type { Source } from './schema';
import type { IniSection, TemplateTarget } from './template';
import type { ConfigDeclaration } from '../../types';

export type CompiledConfig = {
  target: TemplateTarget;
  value: Source;
  sections: IniSection[];
};

export type ConfigModule = {
  compileConfig: (config?: readonly ConfigDeclaration[], nodes?: readonly CompiledNode[]) => CompiledConfig;
};
