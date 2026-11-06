import type { supports } from '../../../providers/surfboard/transform';
import type { SupportedNodeFields } from '../../proxy-node/common';

export type SurfboardNodeFields = SupportedNodeFields<(typeof supports)[number]>;
