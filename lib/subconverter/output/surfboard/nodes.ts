import { SurfboardProvider } from '../../providers/surfboard';
import { projectNode } from '../shared/ini';
import { convertNodes } from '../shared/nodes';
import type { OutputElements } from '../types';

export function transform(nodes: OutputElements['nodes']) {
  const result = convertNodes(
    nodes,
    (values) => new SurfboardProvider().transform('node', values),
    (node) => node.name,
  );

  return {
    ...result,
    entries: result.entries.map((entry) => ({ ...entry, value: projectNode(entry.value, entry.sourceIndex, 'surge') })),
  };
}
