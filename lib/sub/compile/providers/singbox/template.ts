import { appendCollection, defineTemplate, parseObject, TemplateError } from '../../shared/template';

export const template = defineTemplate({
  type: 'singbox',
  parse(input) {
    const value = parseObject(input, 'json');

    appendCollection(value, 'outbounds', []);
    appendCollection(value, 'endpoints', []);

    return { target: 'singbox', format: 'json', value };
  },
  render(document, nodes) {
    if (document.format !== 'json') {
      throw new TemplateError('singbox', 'TEMPLATE_MISMATCH');
    }

    for (const collection of ['outbounds', 'endpoints'] as const) {
      appendCollection(
        document.value,
        collection,
        nodes.filter((node) => (node.collection ?? 'outbounds') === collection).map((node) => node.value),
      );
    }

    return JSON.stringify(document.value);
  },
});
