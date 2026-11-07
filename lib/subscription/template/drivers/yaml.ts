import { parseStructuredDocument } from '../../shared/document';

export function parse(input: string): unknown {
  return parseStructuredDocument(input, 'yaml').value;
}
