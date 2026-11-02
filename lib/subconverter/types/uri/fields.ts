import type { supports } from '../../providers/uri/transform';
import type { SupportedNodeFields } from '../common';

export type UriNodeFields = SupportedNodeFields<(typeof supports)[number]>;
