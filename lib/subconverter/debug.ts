export type TransformDirection = 'fields' | 'node' | 'parse';

export function debugNode(provider: string, direction: TransformDirection, index: number, reason: string): void {
  console.debug('[subconverter]', { provider, direction, index, reason });
}

export class NodeConversionError extends Error {
  constructor(readonly reason: string) {
    super(reason);
  }
}

export function rejectNode(reason: string): never {
  throw new NodeConversionError(reason);
}
