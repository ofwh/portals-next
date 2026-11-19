import { assemble } from './assemble';
import { config } from './config';
import { nodes } from './node';
import { template } from './template';
import type { NodeProvider } from '../../types';

export const loon = {
  ...nodes,
  ...template,
  ...config,
  assemble,
} satisfies NodeProvider;
