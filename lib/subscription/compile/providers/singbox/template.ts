import { mergeConfig } from '../../shared/config';
import { appendCollection, defineTemplate, parseJson, TemplateError } from '../../shared/template';

export const template = defineTemplate({
  type: 'singbox',
  parse(input) {
    const value = parseJson(input);

    appendCollection(value, 'outbounds', []);
    appendCollection(value, 'endpoints', []);

    return { target: 'singbox', format: 'json', value };
  },
  merge: (document, config) =>
    mergeConfig(document, config, { appendArrays: ['outbounds', 'endpoints', 'route.rules', 'route.rule_set'] }),
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
