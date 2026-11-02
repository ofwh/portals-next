import type { supports } from '../../providers/loon/transform';
import type { SupportedNodeFields } from '../common';

export type LoonNodeFields = SupportedNodeFields<(typeof supports)[number]>;
