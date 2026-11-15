import { parseDocument, visit } from 'yaml';
import { validateObject } from './shared';
import { positionAt, TEMPLATE_LIMITS, TemplateParseError } from '../shared';

const { entries: maxEntries, depth: maxDepth } = TEMPLATE_LIMITS;

export function parseYaml(input: string): Record<string, unknown> {
  const document = parseDocument(input, { uniqueKeys: true, strict: true });

  if (document.errors.length || document.warnings.length) {
    const issue = document.errors[0] ?? document.warnings[0];

    throw new TemplateParseError('INVALID_DOCUMENT', positionAt(input, issue.pos[0]));
  }

  let count = 0;

  visit(document, {
    Node(_key, _node, path) {
      if (++count > maxEntries || path.length > maxDepth) {
        throw new Error('Template structure exceeds the limit');
      }
    },
  });

  return validateObject(document.toJS({ maxAliasCount: 100 }));
}
