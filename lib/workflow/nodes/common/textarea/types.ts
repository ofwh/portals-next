import type { OutputFormat } from '../types';

export interface TextareaConfig {
  text: string;
  outputFormat: OutputFormat;
}

export type TextareaOutput = string | Record<string, unknown>;
