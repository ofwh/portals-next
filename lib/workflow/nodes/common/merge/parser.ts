import { configSchema } from './schema';
import type { MergeInput, MergeRunInput } from './types';

export const parseConfig = (raw: unknown) => configSchema.parse(raw);
export const parseInput = (values: readonly MergeInput[]): MergeRunInput => [...values];
