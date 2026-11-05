import type { OutputElements } from '../../types/output';
import { generate as generateLinks } from '../shared/link-subscription';

export async function generate(elements: OutputElements, signal: AbortSignal) {
  return generateLinks('shadowrocket', elements, signal);
}
