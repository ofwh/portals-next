import { clash } from './clash';
import { loon } from './loon';
import { mixed } from './mixed';
import { quanx } from './quanx';
import { singbox } from './singbox';
import { surfboard } from './surfboard';
import { surge } from './surge';
import type { NodeProvider, SubscriptionType } from '../types';

export const providers = { clash, singbox, surge, surfboard, loon, quanx, mixed } as const satisfies Record<
  SubscriptionType,
  NodeProvider
>;

export { clash, loon, mixed, quanx, singbox, surfboard, surge };
export default providers;
