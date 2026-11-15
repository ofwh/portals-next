import { appError } from '@/lib/api';
import type { ConfigDeclaration, ProxyNode } from '@/lib/sub/types';
import { configSchema } from '../model/schema';
import type { CompileNodeData, CompileNodeValue } from '../model/types';

export const parseConfig = (raw: unknown) => configSchema.parse(raw);

export function parseInput(values: readonly CompileNodeValue[]): CompileNodeData {
  const nodes: ProxyNode[] = [];
  const config: ConfigDeclaration[] = [];
  const result: CompileNodeData = { nodes, config };

  for (const value of values) {
    if (!Array.isArray(value)) {
      if (result.template) {
        throw appError('workflow.COMPILE_MULTIPLE_TEMPLATES');
      }

      result.template = value;
      continue;
    }

    for (const item of value) {
      if ('protocol' in item) {
        nodes.push(item);
      } else {
        config.push(item);
      }
    }
  }

  return result;
}
