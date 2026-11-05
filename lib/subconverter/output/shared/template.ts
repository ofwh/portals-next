import { cloneJson, isRecord } from '@/lib/shared/data';
import { fail } from './errors';
import { parseTemplate } from '../../template/schema';
import type { JsonValue, OutputTarget, SymbolBinding } from '../../types/output';
import type {
  SubscriptionTemplate,
  SubscriptionTemplateDocuments,
  SubscriptionTemplateFormat,
} from '../../types/template';

export function validateTemplate(target: OutputTarget, template?: SubscriptionTemplate): void {
  if (template && template.format !== (target === 'clashr' ? 'clash' : target)) {
    fail('assembly', -1, 'template', 'template-format-mismatch');
  }
}

export function templateDocument<T extends SubscriptionTemplateFormat>(
  template: SubscriptionTemplate | undefined,
  format: T,
): SubscriptionTemplateDocuments[T] | undefined {
  if (!template) {
    return undefined;
  }

  return cloneJson(parseTemplate(template, format).document);
}

export function templateSymbols(template: SubscriptionTemplate | undefined, preserveGroups: boolean): SymbolBinding[] {
  if (!template || (template.format !== 'stash' && template.format !== 'singbox')) {
    return [];
  }

  const result: SymbolBinding[] = [];
  const collect = (value: JsonValue | undefined, key: string, kind: SymbolBinding['kind'], optionalName = false) => {
    if (value === undefined || value === null) {
      return;
    }

    if (!Array.isArray(value)) {
      fail('assembly', -1, 'template', 'invalid-template-collection');
    }

    for (const item of value) {
      if (optionalName && isRecord(item) && item[key] === undefined) {
        continue;
      }

      if (!isRecord(item) || typeof item[key] !== 'string' || !item[key].trim()) {
        fail('assembly', -1, 'template', 'invalid-template-collection');
      }

      result.push({ kind, inputName: item[key], outputName: item[key] });
    }
  };

  if (template.format === 'stash') {
    collect(template.document.proxies, 'name', 'node');
    if (preserveGroups) {
      collect(template.document['proxy-groups'], 'name', 'group');
    }
  } else {
    collect(template.document.endpoints, 'tag', 'node', true);
  }

  return result;
}
