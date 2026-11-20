import { and, asc, eq, inArray } from 'drizzle-orm';
import 'server-only';
import { db } from '@/lib/db';
import { tagConfigs, tags } from '@/lib/db/schema';
import type { TagOption } from '@/lib/types/tag';

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export function replaceTags(tx: Transaction, type: string, targetId: string, tagIds: readonly string[]) {
  tx.delete(tagConfigs)
    .where(and(eq(tagConfigs.type, type), eq(tagConfigs.targetId, targetId)))
    .run();

  for (const tagId of tagIds) {
    tx.insert(tagConfigs).values({ tagId, targetId, type }).run();
  }
}

export function findTagIds(type: string, targetId: string): string[] {
  return db
    .select({ id: tagConfigs.tagId })
    .from(tagConfigs)
    .where(and(eq(tagConfigs.type, type), eq(tagConfigs.targetId, targetId)))
    .all()
    .map((row) => row.id);
}

export function attachTags<Row extends { id: string }>(
  tx: Transaction,
  type: string,
  rows: Row[],
): (Row & { tags: TagOption[] })[] {
  if (!rows.length) {
    return [];
  }

  const relations = tx
    .select({
      targetId: tagConfigs.targetId,
      tag: { id: tags.id, label: tags.label, color: tags.color, bgColor: tags.bgColor, rounded: tags.rounded },
    })
    .from(tagConfigs)
    .innerJoin(tags, eq(tagConfigs.tagId, tags.id))
    .where(
      and(
        eq(tagConfigs.type, type),
        inArray(
          tagConfigs.targetId,
          rows.map((row) => row.id),
        ),
      ),
    )
    .orderBy(asc(tags.label), asc(tags.id))
    .all();
  const byTarget = new Map<string, TagOption[]>();

  for (const { targetId, tag } of relations) {
    const selected = byTarget.get(targetId) ?? [];

    selected.push(tag);
    byTarget.set(targetId, selected);
  }

  return rows.map((row) => ({ ...row, tags: byTarget.get(row.id) ?? [] }));
}
