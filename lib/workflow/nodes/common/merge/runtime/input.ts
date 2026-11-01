import { configSchema } from '../model/schema';
import type { MergeInput, MergeRunInput } from '../model/types';

export const parseConfig = (raw: unknown) => configSchema.parse(raw);
export const parseInput = (values: readonly MergeInput[]): MergeRunInput => [...values];
