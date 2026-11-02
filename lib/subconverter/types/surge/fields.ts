import type { supports } from '../../providers/surge/transform';
import type { SupportedNodeFields } from '../common';

export type SurgeNodeFields = SupportedNodeFields<(typeof supports)[number]>;
