import type { supports } from '../../../providers/surge/transform';
import type { SupportedNodeFields } from '../../proxy-node/common';

export type SurgeNodeFields = SupportedNodeFields<(typeof supports)[number]>;
