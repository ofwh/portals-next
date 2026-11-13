import { schema } from './schema';
import { defineNodes, serialize } from '../shared';

export const nodes = defineNodes({
  type: 'surge',
  nodes: schema,
  serialize: (value, definition) => {
    if (!Array.isArray(value.args)) {
      return serialize(value, definition);
    }

    const args = value.args.map((arg: unknown) => `args="${String(arg)}"`).join(', ');
    const output = serialize(Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'args')), definition);
    const anchor = `exec=${String(value.exec)}`;

    return { ...output, content: output.content.replace(anchor, `${anchor}, ${args}`) };
  },
});
