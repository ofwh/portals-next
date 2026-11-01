import type { FormatParser } from './types';
import { parseShareLink } from './vendor/links';

export function extractLinks(content: string): unknown[] {
  return content.split(/\r?\n/).flatMap((line) => {
    const node = parseShareLink(line);

    return node ? [node] : [];
  });
}

export const linksProvider = {
  matches: (content) => /(^|\n)\s*[a-z][a-z0-9+.-]*:\/\//i.test(content),
  extract: extractLinks,
} satisfies FormatParser;
