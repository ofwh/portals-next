import { stringify } from 'yaml';
import { mergeConfig } from '../../shared/config';
import { appendCollection, defineTemplate, parseYaml, TemplateError } from '../../shared/template';

export const template = defineTemplate({
  type: 'clash',
  parse(input) {
    const value = parseYaml(input);

    appendCollection(value, 'proxies', []);

    return { target: 'clash', format: 'yaml', value };
  },
  merge: (document, config) =>
    mergeConfig(document, config, {
      appendArrays: ['proxies', 'proxy-groups', 'rules'],
      shallowObjects: ['rule-providers'],
    }),
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
