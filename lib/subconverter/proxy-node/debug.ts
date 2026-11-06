import logger from '@/lib/api/logger';
import type { TransformDirection } from '../types/proxy-node/transform';

export function debugNode(
  provider: string,
  direction: TransformDirection,
  index: number,
  reason: string,
  data: unknown,
): void {
  logger.warn(reason, { provider, direction, index, data });
}
