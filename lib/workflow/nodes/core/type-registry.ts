import { appError } from '@/lib/api';
import { assertJson, cloneJson, freezeDeep, nonempty, positiveInteger } from '../../utils';
import type { NamedType, TypeDescriptor } from '../types';

export class TypeRegistry {
  private readonly types = new Map<string, NamedType<unknown>>();

  registerType<T>(type: NamedType<T>): void {
    const descriptor = type.descriptor;

    if (descriptor.kind !== 'ref' || !nonempty(descriptor.id) || !positiveInteger(descriptor.version)) {
      throw appError('common.INVALID_PARAMS');
    }

    const key = this.key(descriptor);

    if (this.types.has(key) && process.env.NODE_ENV !== 'development') {
      throw appError('workflow.DUPLICATE_TYPE');
    }

    this.validateDescriptor(type.base);
    this.types.set(
      key,
      Object.freeze({
        descriptor: freezeDeep(cloneJson(descriptor)),
        base: freezeDeep(cloneJson(type.base)),
        parse: (value: unknown) => type.parse(value),
      }),
    );
  }

  getType(descriptor: Extract<TypeDescriptor, { kind: 'ref' }>): NamedType<unknown> {
    const type = this.types.get(this.key(descriptor));

    if (!type) {
      throw appError('workflow.TYPE_NOT_FOUND');
    }

    return type;
  }

  validateDescriptor(descriptor: TypeDescriptor): void {
    assertJson(descriptor);
    switch (descriptor.kind) {
      case 'any':
      case 'string':
      case 'number':
      case 'boolean':
      case 'null':
        return;
      case 'array':
        this.validateDescriptor(descriptor.items);

        return;
      case 'record':
        this.validateDescriptor(descriptor.values);

        return;
      case 'union':
        if (!descriptor.types.length) {
          throw appError('common.INVALID_PARAMS');
        }

        descriptor.types.forEach((type) => this.validateDescriptor(type));

        return;
      case 'ref':
        this.getType(descriptor);

        return;
      default:
        throw appError('common.INVALID_PARAMS');
    }
  }

  isAssignable(source: TypeDescriptor, target: TypeDescriptor): boolean {
    this.validateDescriptor(source);
    this.validateDescriptor(target);

    return this.assignable(source, target);
  }

  private assignable(source: TypeDescriptor, target: TypeDescriptor): boolean {
    if (target.kind === 'any') {
      return true;
    }

    if (source.kind === 'any') {
      return false;
    }

    if (source.kind === 'union') {
      return source.types.every((type) => this.assignable(type, target));
    }

    if (target.kind === 'union') {
      return target.types.some((type) => this.assignable(source, type));
    }

    if (source.kind === 'ref') {
      if (target.kind === 'ref') {
        return source.id === target.id && source.version === target.version;
      }

      return this.assignable(this.getType(source).base, target);
    }

    if (target.kind === 'ref') {
      return false;
    }

    if (source.kind === 'array' && target.kind === 'array') {
      return this.assignable(source.items, target.items);
    }

    if (source.kind === 'record' && target.kind === 'record') {
      return this.assignable(source.values, target.values);
    }

    return source.kind === target.kind;
  }

  parse(descriptor: TypeDescriptor, value: unknown): unknown {
    assertJson(value);
    this.validateDescriptor(descriptor);
    switch (descriptor.kind) {
      case 'any':
        return cloneJson(value);
      case 'null':
        if (value === null) {
          return value;
        }

        break;
      case 'string':
      case 'boolean':
        if (typeof value === descriptor.kind) {
          return value;
        }

        break;
      case 'number':
        if (typeof value === 'number' && Number.isFinite(value)) {
          return value;
        }

        break;
      case 'array':
        if (Array.isArray(value)) {
          return value.map((item) => this.parse(descriptor.items, item));
        }

        break;
      case 'record':
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          return Object.fromEntries(
            Object.entries(value).map(([key, item]) => [key, this.parse(descriptor.values, item)]),
          );
        }

        break;
      case 'ref': {
        const parsed = this.getType(descriptor).parse(value);

        this.parse(this.getType(descriptor).base, parsed);

        return parsed;
      }
      case 'union':
        for (const type of descriptor.types) {
          try {
            return this.parse(type, value);
          } catch {
            continue;
          }
        }
        break;
    }

    throw appError('common.INVALID_PARAMS');
  }

  private key(descriptor: Extract<TypeDescriptor, { kind: 'ref' }>): string {
    return JSON.stringify([descriptor.id, descriptor.version]);
  }
}
export const typeRegistry = new TypeRegistry();
export const registerType = <T>(type: NamedType<T>): void => typeRegistry.registerType(type);
export const isAssignable = (source: TypeDescriptor, target: TypeDescriptor): boolean =>
  typeRegistry.isAssignable(source, target);
