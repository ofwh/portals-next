import type { supports } from '../../../providers/loon/transform';
import type { SupportedNodeFields } from '../../proxy-node/common';

export type LoonNodeFields = SupportedNodeFields<(typeof supports)[number]>;
