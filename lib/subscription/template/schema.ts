import { appError } from '@/lib/api';
import { assertJson, isRecord } from '@/lib/shared/data';
import type { NamedType } from '@/lib/types/workflow';
import { isTemplateFormat } from '../shared';
import type { IniDocument, TemplateDocument } from '../types';

function isIni(value: unknown): value is IniDocument {
  return (
    isRecord(value) &&
    Object.keys(value).length === 1 &&
    Array.isArray(value.sections) &&
    value.sections.every(
      (section: unknown) =>
        isRecord(section) &&
        Object.keys(section).every((key) => ['name', 'header', 'lines'].includes(key)) &&
        (section.name === null || typeof section.name === 'string') &&
        (!Object.hasOwn(section, 'header') || typeof section.header === 'string') &&
        Array.isArray(section.lines) &&
        section.lines.every((line: unknown) => typeof line === 'string'),
    )
  );
}

export const templateType: NamedType<TemplateDocument> = {
  descriptor: { kind: 'ref', id: 'Template', version: 1 },
  base: { kind: 'record', values: { kind: 'any' } },
  parse(value) {
    assertJson(value);

    if (!isRecord(value) || Object.keys(value).length !== 2 || !isTemplateFormat(value.format)) {
      throw appError('common.INVALID_PARAMS');
    }

    if (value.format === 'ini') {
      if (!isIni(value.value)) {
        throw appError('common.INVALID_PARAMS');
      }

      return { format: value.format, value: value.value };
    }

    if (!isRecord(value.value)) {
      throw appError('common.INVALID_PARAMS');
    }

    return { format: value.format, value: value.value };
  },
};
