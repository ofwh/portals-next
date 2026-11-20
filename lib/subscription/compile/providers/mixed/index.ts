import { assemble } from './assemble';
import { nodes } from './node';
import type { NodeProvider } from '../../types';

export const mixed = { ...nodes, assemble } satisfies NodeProvider;
