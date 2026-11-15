import { validateObject } from './shared';

export function parseJson(input: string): Record<string, unknown> {
  return validateObject(JSON.parse(input));
}
