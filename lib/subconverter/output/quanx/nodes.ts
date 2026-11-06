import { QuanXProvider } from '../../providers/quanx';
import type { OutputElements } from '../../types/output';
import { ini } from '../shared/ini';
import { convertNodes } from '../shared/nodes';

export function transform(nodes: OutputElements['nodes']) {
  const result = convertNodes(
    nodes,
    (values) => new QuanXProvider().transform('node', values),
    (node) => node.name,
  );

  return {
    ...result,
    entries: result.entries.map((entry) => ({
      ...entry,
      value: ini.projectNode(entry.value, entry.sourceIndex, 'quanx'),
    })),
  };
}
