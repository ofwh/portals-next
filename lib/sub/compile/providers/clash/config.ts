import { Buffer } from 'node:buffer';
import { CONFIG_TYPES } from '../../../shared';
import type { BaseRuleset } from '../../../types';
import {
  appendValue,
  bind,
  defineConfig,
  objectValue,
  options,
  parameters,
  positional,
  rule,
  text,
} from '../../shared/config';
import type { Source } from '../../types';

function providerName(address: string): string {
  let separator = address.lastIndexOf('/');

  if (separator < 0) {
    separator = Math.max(0, address.lastIndexOf('\\'));
  }

  const extension = address.lastIndexOf('.');
  const end = extension < separator ? address.length : extension;
  const filename = Buffer.from(address.slice(separator + 1, end));
  const decoded: number[] = [];

  for (let index = 0; index < filename.length; index++) {
    let byte = filename[index];

    if (byte === 0x2b) {
      byte = 0x20;
    } else if (byte === 0x25 && index + 2 < filename.length) {
      const hex = String.fromCharCode(filename[index + 1], filename[index + 2]);

      if (/^[\da-f]{2}$/i.test(hex)) {
        byte = parseInt(hex, 16);
        index += 2;
      }
    }

    if (byte !== 0x0d && byte !== 0x0a) {
      decoded.push(byte);
    }
  }

  return Buffer.from(decoded).toString('utf8');
}

function resource(entry: BaseRuleset, fields: Source, providers: Source): string {
  const address = fields.url ?? fields.path;
  const base = address === undefined ? entry.name : providerName(text(address));
  let name = base;
  let suffix = 2;

  while (Object.hasOwn(providers, name)) {
    name = `${base} ${suffix++}`;
  }

  Object.defineProperty(providers, name, { value: fields, enumerable: true, configurable: true, writable: true });

  return name;
}

export const config = defineConfig('clash', (declaration, output) => {
  const entry = declaration.value;
  const fields = options(entry);

  if (declaration.type === CONFIG_TYPES.PROXY_GROUP) {
    bind(fields, 'name', entry.name);
    bind(fields, 'type', declaration.value.kind);
    const members = positional(entry);

    if (members.length) {
      fields.proxies = members;
    }

    appendValue(output.value, 'proxy-groups', fields);
  } else if (declaration.type === CONFIG_TYPES.RULESET) {
    if (declaration.value.kind === 'RULE-SET' && ['http', 'file', 'inline'].includes(String(fields.type))) {
      const all = parameters(entry);
      const flags = all.filter((parameter) => parameter.type === 'positional');
      const name = resource(declaration.value, fields, objectValue(output.value, 'rule-providers'));

      appendValue(
        output.value,
        'rules',
        rule({ name: entry.name, kind: 'RULE-SET', parameters: [{ type: 'positional', value: name }, ...flags] }),
      );
    } else {
      appendValue(output.value, 'rules', rule(declaration.value));
    }
  } else {
    throw new Error('Custom declarations are not supported');
  }
});
