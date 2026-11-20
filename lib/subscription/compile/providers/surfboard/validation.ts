import { safe } from '../../shared/ini';
import type { NodeSource } from '../../types';
import { validate as validateSurge } from '../surge/validation';

export function validate(node: Readonly<NodeSource>): boolean {
  return (
    validateSurge(node) &&
    [node.password, node.uuid, node.path, node.edge, node.obfsPassword].every((value) => safe(value))
  );
}
