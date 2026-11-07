import { configSchema } from '../model/schema';

export const parseConfig = (raw: unknown) => configSchema.parse(raw);
export const parseInput = (values: readonly string[]): readonly string[] => values;
