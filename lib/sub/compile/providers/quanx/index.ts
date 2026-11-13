import { nodes } from './node';
import { template } from './template';
import { defineProvider } from '../shared';

export const quanx = defineProvider({ ...nodes, ...template });
