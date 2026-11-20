import { schema } from './schema';
import { sections } from './sections';
import { validate } from './validation';
import { serialize } from '../../shared/ini';
import { defineNodes } from '../shared';

export const nodes = defineNodes({
  type: 'surge',
  schema,
  prepare: (source) => ({ ...source, name: source.name.replaceAll('=', '-') }),
  validate,
  serialize: (value, definition) => {
    if (!Array.isArray(value.args)) {
      return { ...serialize(value, definition), sections: sections(value) };
    }

    const args = value.args.map((arg: unknown) => `args="${String(arg)}"`).join(', ');
    const output = serialize(Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'args')), definition);
    const anchor = `exec=${String(value.exec)}`;

    return { ...output, sections: sections(value), content: output.content.replace(anchor, `${anchor}, ${args}`) };
  },
});
