import type { PolicyTransformerModule } from './types';
import { POLICY_ERROR_CODES } from '../../shared/errors';
import { readSingboxGroupDeclaration } from '../declarations/singbox';
import { EntryError } from '../diagnostics';
import { selectResolver } from '../resolvers/select';
import { booleanOption } from '../resolvers/shared';
import { singboxUrlTestResolver } from '../resolvers/singbox';

const resolvers = [selectResolver, singboxUrlTestResolver];

export const singboxTransformer: PolicyTransformerModule = {
  type: 'singbox',
  label: 'sing-box',
  resolvers,
  transform(input, format) {
    const declaration = readSingboxGroupDeclaration(input, format);
    const resolver = resolvers.find((resolver) => resolver.kind === declaration.kind);

    if (!resolver) {
      throw new EntryError(POLICY_ERROR_CODES.POLICY_TRANSFORMER_MISMATCH, 'type');
    }

    const interrupt = booleanOption(declaration, 'interrupt_exist_connections');
    const group = resolver.resolve(declaration);

    if (interrupt !== undefined && group.kind !== 'select') {
      throw new EntryError(POLICY_ERROR_CODES.INVALID_POLICY_OPTIONS, 'interrupt_exist_connections');
    }

    return { ...group, ...(interrupt !== undefined ? { interruptExistConnections: interrupt } : {}) };
  },
};
