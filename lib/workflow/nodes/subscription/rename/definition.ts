import type { RenameConfig } from './types';
import { nodeLabel } from '../../utils';

export const definition = { type: 'subscription.rename', ...nodeLabel('subscriptionNodes.rename.name'), version: 1 };
export const defaultConfig: RenameConfig = { rules: [] };
