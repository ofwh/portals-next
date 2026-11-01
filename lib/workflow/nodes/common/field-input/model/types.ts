import type { OutputFormat } from '../../types';

export interface FieldInputConfig {
  text: string;
  outputFormat: OutputFormat;
}

export type FieldInputOutput = string | Record<string, unknown>;
