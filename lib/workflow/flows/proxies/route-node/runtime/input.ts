import { configSchema } from '../model/schema';

export const parseConfig = (raw: unknown) => configSchema.parse(raw);
export const parseInput = (_values: readonly never[]): null => null;
