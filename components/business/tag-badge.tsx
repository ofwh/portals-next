import type { CSSProperties } from 'react';
import { Badge } from '@/components/ui/badge';
import type { TagOption } from '@/lib/types/tag';

export function tagStyle(tag: TagOption): CSSProperties {
  return {
    color: tag.color,
    backgroundColor: tag.bgColor,
  };
}

export function TagBadge({ tag }: { tag: TagOption }) {
  return (
    <Badge
      style={tagStyle(tag)}
      title={tag.label}
      className={tag.rounded === 1 ? 'max-w-full rounded-full' : 'max-w-full rounded-sm'}
    >
      <span className="truncate">{tag.label}</span>
    </Badge>
  );
}
