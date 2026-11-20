import { isRecord } from '@/lib/shared/data';
import type { NodeSection, Source } from '../../types';

export function sections(value: Source): NodeSection[] {
  return isRecord(value.section)
    ? [{ name: `WireGuard ${String(value['section-name'])}`, entries: value.section }]
    : [];
}
