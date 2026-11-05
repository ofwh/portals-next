import { appError } from '@/lib/api';
import { assertJson, isRecord } from '@/lib/shared/data';
import type { NativeObject } from '../types/output';
import type { IniTemplateDocument, SubscriptionTemplate, SubscriptionTemplateFormat } from '../types/template';

export function parseObject(value: unknown): NativeObject {
  assertJson(value);
  if (!isRecord(value)) {
    throw appError('common.INVALID_PARAMS');
  }

  return value as NativeObject;
}

export function parseIniDocument(value: unknown): IniTemplateDocument {
  assertJson(value);
  if (!isRecord(value) || Object.keys(value).length !== 1 || !Array.isArray(value.sections)) {
    throw appError('common.INVALID_PARAMS');
  }

  return {
    sections: value.sections.map((section: unknown) => {
      if (
        !isRecord(section) ||
        Object.keys(section).length !== 2 ||
        typeof section.name !== 'string' ||
        !section.name.trim() ||
        !Array.isArray(section.lines) ||
        !section.lines.every((line: unknown) => typeof line === 'string')
      ) {
        throw appError('common.INVALID_PARAMS');
      }

      return { name: section.name, lines: section.lines as string[] };
    }),
  };
}

export function parseTemplate<T extends SubscriptionTemplateFormat>(
  value: unknown,
  format: T,
): SubscriptionTemplate<T> {
  if (!isRecord(value) || value.format !== format || Object.keys(value).length !== 2) {
    throw appError('common.INVALID_PARAMS');
  }

  const document = ['surge', 'surfboard', 'quanx', 'loon'].includes(format)
    ? parseIniDocument(value.document)
    : parseObject(value.document);

  return { format, document } as SubscriptionTemplate<T>;
}
