import type { AST } from 'toml-eslint-parser';
import { ParseError, parseTOML } from 'toml-eslint-parser';
import type { ConfigObject, ConfigValue } from '../../types/configuration';
import { ConfigSyntaxError } from '../errors';
import { createObject, entryFor, isObject, valuesOf } from '../model';

function objectAt(root: ConfigObject, path: (string | number)[]): ConfigObject {
  let current = root;

  for (let index = 0; index < path.length; index++) {
    const key = path[index];

    if (typeof key !== 'string') {
      throw new Error('Invalid TOML table path');
    }

    const entry = entryFor(current, key);
    const next = path[index + 1];
    const slot = typeof next === 'number' ? next : 0;
    let object = entry.values[slot];

    if (!isObject(object)) {
      object = createObject();
      entry.values[slot] = object;
    }

    current = object;

    if (typeof next === 'number') {
      index++;
    }
  }

  return current;
}

function assign(object: ConfigObject, node: AST.TOMLKeyValue): void {
  const path = node.key.keys.map((key) => (key.type === 'TOMLBare' ? key.name : key.value));
  const parent = objectAt(object, path.slice(0, -1));

  entryFor(parent, path[path.length - 1]).values = valuesOf(convert(node.value));
}

function convert(node: AST.TOMLContentNode): ConfigValue {
  if (node.type === 'TOMLArray') {
    return node.elements.map(convert);
  }

  if (node.type === 'TOMLInlineTable') {
    const object = createObject();

    for (const entry of node.body) {
      assign(object, entry);
    }

    return object;
  }

  switch (node.kind) {
    case 'string':
      return node.value;
    case 'boolean':
      return node.value ? 'true' : 'false';
    case 'integer':
      return node.bigint.toString();
    case 'float':
      return node.number.replaceAll('_', '');
    default:
      return node.datetime.replace(/[t ]/, 'T').replace(/z$/, 'Z');
  }
}

export function parseToml(content: string): ConfigObject {
  try {
    const ast = parseTOML(content, { tomlVersion: '1.0' });
    const root = createObject();

    for (const node of ast.body[0].body) {
      if (node.type === 'TOMLKeyValue') {
        assign(root, node);
      } else {
        const table = objectAt(root, node.resolvedKey);

        for (const entry of node.body) {
          assign(table, entry);
        }
      }
    }

    return root;
  } catch (error) {
    if (error instanceof ParseError) {
      throw new ConfigSyntaxError('toml', error.lineNumber, error.column + 1, error.message);
    }

    throw error;
  }
}
