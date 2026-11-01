import type { TextareaConfig } from './types';
import { nodeLabel } from '../../utils';

export const definition = { type: 'common.textarea', ...nodeLabel('commonNodes.textarea.name'), version: 1 };
export const defaultConfig: TextareaConfig = { text: '', outputFormat: 'TEXT' };
