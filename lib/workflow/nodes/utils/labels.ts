import type { MessageTree } from '@/i18n/config';
import { appError } from '@/lib/api';
import { nodeMessages } from '../messages';
import type { NodeLabel } from '../types';

function readLabel(messages: MessageTree, key: string): string | undefined {
  let value: string | MessageTree | undefined = messages;

  for (const part of key.split('.')) {
    if (typeof value !== 'object') {
      return undefined;
    }

    value = value[part];
  }

  return typeof value === 'string' ? value : undefined;
}

export function nodeLabel(nameKey: string, messages: MessageTree = nodeMessages.en): NodeLabel {
  const name = readLabel(messages, nameKey) ?? readLabel(nodeMessages.en, nameKey);

  if (!name) {
    throw appError('common.INVALID_PARAMS');
  }

  return { name, nameKey };
}
