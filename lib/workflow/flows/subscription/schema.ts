import { appError } from '@/lib/api';
import { assertJson, isRecord } from '@/lib/shared/data';
import { validateFields } from '@/lib/subconverter/proxy-node/mapping';
import { isTemplateFormat, templateFormats } from '@/lib/subconverter/template/formats';
import { parseTemplate } from '@/lib/subconverter/template/schema';
import type { ProxyNodeFields } from '@/lib/subconverter/types';
import type { SubscriptionTemplate } from '@/lib/subconverter/types/template';
import type { NamedType, ValueSchema } from '@/lib/types/workflow';
import { arrayOf } from '../../node/core/schemas';

const proxyNode: NamedType<ProxyNodeFields> = {
  descriptor: { kind: 'ref', id: 'subscription.proxy-node-fields', version: 1 },
  base: { kind: 'record', values: { kind: 'any' } },
  parse(value) {
    assertJson(value);
    try {
      const node: unknown = JSON.parse(JSON.stringify(validateFields(value)));

      assertJson(node);

      return node as ProxyNodeFields;
    } catch {
      throw appError('common.INVALID_PARAMS');
    }
  },
};
const proxyNodes = arrayOf(proxyNode);

const templates: NamedType<SubscriptionTemplate>[] = templateFormats.map((format) => ({
  descriptor: { kind: 'ref', id: `subscription.template.${format}`, version: 1 },
  base: { kind: 'record', values: { kind: 'any' } },
  parse: (value) => parseTemplate(value, format),
}));
const templateTypesByFormat = Object.fromEntries(
  templates.map((schema, index) => [templateFormats[index], schema.descriptor]),
);
const template: ValueSchema<SubscriptionTemplate> = {
  descriptor: { kind: 'union', types: templates.map((schema) => schema.descriptor) },
  parse(value) {
    if (!isRecord(value) || !isTemplateFormat(value.format)) {
      throw appError('common.INVALID_PARAMS');
    }

    return parseTemplate(value, value.format);
  },
};

export const schema = { proxyNode, proxyNodes, template, templates, templateTypesByFormat };
