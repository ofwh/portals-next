import { nodes } from './node';
import { template } from './template';
import { defineProvider } from '../shared';

export const loon = defineProvider({ ...nodes, ...template });
