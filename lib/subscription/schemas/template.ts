import { appError } from '@/lib/api';
import { assertJson, isRecord } from '@/lib/shared/data';
import type { NamedType } from '@/lib/types/workflow';
import { isTemplateFormat } from '../shared/template';
import { textLimits } from '../shared/text';
import type { IniDocument, ParsedTemplate, TemplateValue } from '../types/template';

function isValue(value: unknown, depth = 0, budget = { count: 0 }): value is TemplateValue {
  if (++budget.count > textLimits.entries * 16 || depth > textLimits.depth) {
    return false;
  }

  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  ) {
    return true;
  }

  return (
    (Array.isArray(value) || isRecord(value)) &&
    Object.values(value).every((child: unknown) => isValue(child, depth + 1, budget))
  );
}

function isIni(value: unknown): value is IniDocument {
  return (
    isRecord(value) &&
    Object.keys(value).length === 1 &&
    Array.isArray(value.sections) &&
    value.sections.every(
      (section: unknown) =>
        isRecord(section) &&
        Object.keys(section).length === 2 &&
        (section.name === null || typeof section.name === 'string') &&
        Array.isArray(section.entries) &&
        section.entries.every(
          (entry: unknown) =>
            isRecord(entry) &&
            Object.keys(entry).length === 2 &&
            (entry.key === null || typeof entry.key === 'string') &&
            typeof entry.value === 'string',
        ),
    )
  );
}

export const templateType: NamedType<ParsedTemplate> = {
  descriptor: { kind: 'ref', id: 'Template', version: 1 },
  base: { kind: 'record', values: { kind: 'any' } },
  parse(value) {
    if (!isRecord(value) || Object.keys(value).length !== 2 || !isTemplateFormat(value.format)) {
      throw appError('common.INVALID_PARAMS');
    }

    if (value.format === 'ini') {
      if (!isIni(value.value)) {
        throw appError('common.INVALID_PARAMS');
      }

      assertJson(value);

      return { format: value.format, value: value.value };
    }

    if (!isValue(value.value)) {
      throw appError('common.INVALID_PARAMS');
    }

    assertJson(value);

    return { format: value.format, value: value.value };
  },
};
