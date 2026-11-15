import { stringify } from 'yaml';
import { appendCollection, defineTemplate, parseYaml, TemplateError } from '../../shared/template';

export const template = defineTemplate({
  type: 'clash',
  parse(input) {
    const value = parseYaml(input);

    appendCollection(value, 'proxies', []);

    return { target: 'clash', format: 'yaml', value };
  },
  render(document, nodes) {
    if (document.format !== 'yaml') {
      throw new TemplateError('clash', 'TEMPLATE_MISMATCH');
    }

    appendCollection(
      document.value,
      'proxies',
      nodes.map((node) => node.value),
    );

    return stringify(document.value, { lineWidth: 0 }).trimEnd();
  },
});
