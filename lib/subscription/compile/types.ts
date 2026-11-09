import type { CompileDiagnostic, CompileOptions, CompileParams, CompileTarget } from '../types/compile';
import type { ProxyNode, ProxyProtocol } from '../types/proxy-node';
import type { TemplateValue } from '../types/template';

export type TargetObject = { [key: string]: TemplateValue };
export type CompileContext = CompileParams & {
  options: Required<CompileOptions>;
  diagnostics: CompileDiagnostic[];
  protocols: readonly ProxyProtocol[];
};
export type EncodedNode<T> = { node: ProxyNode; value: T };
export type CompileTransformer = {
  type: CompileTarget;
  label: string;
  protocols: readonly ProxyProtocol[];
  format: 'yaml' | 'json' | 'ini' | 'uri';
  compile(context: CompileContext): string;
};
