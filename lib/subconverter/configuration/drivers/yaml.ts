import { isAlias, isMap, isNode, isScalar, isSeq, LineCounter, parseAllDocuments, Scalar } from 'yaml';
import type { Node } from 'yaml';
import { ConfigSyntaxError } from '../errors';
import { createObject, isObject, valuesOf } from '../model';
import type { ConfigObject, ConfigValue } from '../types';

const prefix = 'tag:yaml.org,2002:';
const allowedTags = new Set(['map', 'seq', 'str', 'null', 'bool', 'int', 'float'].map((tag) => prefix + tag));
const maxDepth = 100;
const maxAliases = 100;
const maxExpandedNodes = 10000;

export function parseYaml(content: string): ConfigObject {
  const lines = new LineCounter();
  const documents = parseAllDocuments(content, {
    lineCounter: lines,
    prettyErrors: false,
    strict: true,
    uniqueKeys: true,
    schema: 'core',
    resolveKnownTags: false,
    customTags: (tags) =>
      tags.map((tag) => {
        if (
          typeof tag === 'string' ||
          tag.collection ||
          !['int', 'float', 'bool'].some((name) => tag.tag === prefix + name)
        ) {
          return tag;
        }

        return {
          ...tag,
          resolve(source: string) {
            let text = source;

            if (tag.tag === prefix + 'int') {
              text = BigInt(source).toString();
            } else if (tag.tag === prefix + 'bool') {
              text = source.toLowerCase();
            }

            const scalar = new Scalar(text);

            scalar.tag = tag.tag;

            return scalar;
          },
        };
      }),
  });

  function fail(message: string, offset = 0): never {
    const position = lines.linePos(offset);

    throw new ConfigSyntaxError('yaml', position.line, position.col, message);
  }

  if (documents.length !== 1) {
    fail('YAML requires exactly one mapping document', documents[1]?.range?.[0]);
  }

  const document = documents[0];

  const error = document.errors[0] ?? document.warnings.find((warning) => warning.code === 'TAG_RESOLVE_FAILED');

  if (error) {
    fail(error.message, error.pos[0]);
  }

  if (!isMap(document.contents)) {
    fail('YAML root must be a mapping', document.contents?.range?.[0]);
  }

  const active = new Set<Node>();
  let aliases = 0;
  let expandedNodes = 0;

  function convert(node: unknown, depth: number): ConfigValue {
    if (node === null) {
      return null;
    }

    if (!isNode(node)) {
      fail('Unsupported YAML node');
    }

    const offset = node.range?.[0];

    if (depth > maxDepth || ++expandedNodes > maxExpandedNodes) {
      fail('YAML expansion exceeds depth or node limit', offset);
    }

    if (active.has(node)) {
      fail('Cyclic YAML alias', offset);
    }

    if (node.tag && !allowedTags.has(node.tag)) {
      fail('Unsupported YAML tag', offset);
    }

    active.add(node);

    try {
      if (isAlias(node)) {
        if (++aliases > maxAliases) {
          fail('YAML alias expansion limit exceeded', offset);
        }

        const target = node.resolve(document);

        if (!target) {
          fail('Unresolved YAML alias', offset);
        }

        return convert(target, depth + 1);
      }

      if (isMap(node)) {
        const object = createObject();
        const keys = new Set<string>();

        for (const pair of node.items) {
          const key = pair.key;

          if (
            !isScalar(key) ||
            typeof key.value !== 'string' ||
            (key.tag !== undefined && key.tag !== prefix + 'str')
          ) {
            fail('YAML mapping keys must be strings', isNode(key) ? key.range?.[0] : offset);
          }

          if (keys.has(key.value)) {
            fail('Duplicate YAML mapping key', key.range?.[0]);
          }

          keys.add(key.value);
          object.entries.push({ key: key.value, values: valuesOf(convert(pair.value, depth + 1)) });
        }

        return object;
      }

      if (isSeq(node)) {
        return node.items.map((item) => convert(item, depth + 1));
      }

      if (isScalar(node) && (node.value === null || typeof node.value === 'string')) {
        return node.value;
      }

      fail('Unsupported YAML scalar', offset);
    } finally {
      active.delete(node);
    }
  }

  const result = convert(document.contents, 0);

  if (!isObject(result)) {
    fail('YAML root must be a mapping');
  }

  return result;
}
