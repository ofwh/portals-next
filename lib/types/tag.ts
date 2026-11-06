import type { tags } from '@/lib/db/schema';
import type { PaginationParams } from './pagination';

export type TagOption = Pick<typeof tags.$inferSelect, 'id' | 'label' | 'color' | 'bgColor' | 'rounded'>;

export interface TagListParams extends PaginationParams {
  group?: string;
  search: string;
}

export type TagInput = Omit<typeof tags.$inferSelect, 'id' | 'createdAt' | 'updatedAt' | 'border'>;

export type TagDetail = TagInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type TagUpdateInput = TagInput & { id?: string };

export type TagFormChange = <Key extends keyof TagInput>(key: Key, value: TagInput[Key]) => void;
