import { nodes } from './node';
import { template } from './template';
import { defineProvider } from '../shared';

export const surge = defineProvider({ ...nodes, ...template });
