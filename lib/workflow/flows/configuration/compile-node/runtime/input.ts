import { appError } from '@/lib/api';
import { configSchema } from '../model/schema';
import type { CompileNodeData, CompileNodeValue } from '../model/types';

export const parseConfig = (raw: unknown) => configSchema.parse(raw);

export function parseInput(values: readonly CompileNodeValue[]): CompileNodeData {
  const result: CompileNodeData = { nodes: [], groups: [], rulesets: [] };

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
        result.nodes.push(item);
      } else if ('selectors' in item) {
        result.groups.push(item);
      } else {
        result.rulesets.push(item);
      }
    }
  }

  return result;
}
