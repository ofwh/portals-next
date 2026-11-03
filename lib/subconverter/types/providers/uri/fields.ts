import type { supports } from '../../../providers/uri/transform';
import type { SupportedNodeFields } from '../../proxy-node/common';

export type UriNodeFields = SupportedNodeFields<(typeof supports)[number]>;
