import type { supports } from '../../../providers/base64/transform';
import type { SupportedNodeFields } from '../../proxy-node/common';

export type Base64NodeFields = SupportedNodeFields<(typeof supports)[number]>;
