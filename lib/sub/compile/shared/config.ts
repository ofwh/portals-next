import { isRecord } from '@/lib/shared/data';
import { createGroupResolver } from './members';
import { CONFIG_TYPES } from '../../shared';
import type { BaseCustomConfig, BaseProxyGroup, BaseRuleset, ConfigDeclaration, ConfigParameter } from '../../types';
import type { CompiledConfig, ConfigModule, ParsedTemplate, Source, SubscriptionType, TemplateTarget } from '../types';

export class ConfigCompileError extends Error {
  constructor(
    public readonly target: SubscriptionType,
    message: string,
    public readonly index?: number,
  ) {
    super(`Invalid ${target} config${index === undefined ? '' : ` at declaration ${index + 1}`}: ${message}`);
    this.name = 'ConfigCompileError';
  }
}

export function defineConfig(
  target: TemplateTarget,
  convert: (declaration: ConfigDeclaration, output: CompiledConfig) => void,
): ConfigModule {
  return {
    compileConfig(config = [], nodes = []) {
      const output: CompiledConfig = { target, value: {}, sections: [] };
      const resolveGroup = createGroupResolver(config, nodes, target);

      for (const [index, declaration] of config.entries()) {
        try {
          convert(
            declaration.type === CONFIG_TYPES.PROXY_GROUP
              ? { ...declaration, value: resolveGroup(declaration.value) }
              : declaration,
            output,
          );
        } catch (error) {
          if (!(error instanceof Error)) {
            throw error;
          }

          throw new ConfigCompileError(target, error.message, index);
        }
      }

      return output;
    },
  };
}

export function parameters(entry: BaseCustomConfig): ConfigParameter[] {
  return entry.parameters.map((parameter) => ({ ...parameter }));
}

export function options(entry: BaseCustomConfig): Source {
  return Object.fromEntries(
    parameters(entry).flatMap((parameter) => (parameter.type === 'named' ? [[parameter.name, parameter.value]] : [])),
  );
}

export function positional(entry: BaseCustomConfig): string[] {
  return parameters(entry).flatMap((parameter) => (parameter.type === 'positional' ? [parameter.value] : []));
}

export function namedOnly(entry: BaseCustomConfig): Source {
  if (positional(entry).length) {
    throw new Error('Only named parameters are supported');
  }

  return options(entry);
}

export function bind(value: Source, key: string, expected: string): void {
  if (Object.hasOwn(value, key) && value[key] !== expected) {
    throw new Error(`${key} must match the declaration`);
  }

  Object.defineProperty(value, key, { value: expected, enumerable: true, configurable: true, writable: true });
}

export function text(value: unknown): string {
  if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
    throw new Error('Expected a scalar value');
  }

  const result = String(value);

  if (/[\r\n\x00-\x1f\x7f]/.test(result)) {
    throw new Error('Control characters are not supported');
  }

  return result;
}

export function atom(value: unknown): string {
  const result = text(value);

  return /[,="\s]/.test(result) ? quote(result) : result;
}

export function quote(value: unknown): string {
  return `"${text(value).replaceAll('"', '\\"')}"`;
}

export function parameter(value: ConfigParameter): string {
  return value.type === 'positional' ? atom(value.value) : `${atom(value.name)}=${atom(value.value)}`;
}

export function proxyGroup(entry: BaseProxyGroup, target: TemplateTarget): string {
  const values = parameters(entry).map((value) => {
    if (
      target === 'loon' &&
      entry.kind === 'ssid' &&
      value.type === 'named' &&
      !['default', 'cellular', 'img-url'].includes(value.name)
    ) {
      return `${quote(value.name)}=${atom(value.value)}`;
    }

    return parameter(value);
  });

  return target === 'quanx'
    ? `${atom(entry.kind)} = ${[atom(entry.name), ...values].join(',')}`
    : `${atom(entry.name)} = ${[atom(entry.kind), ...values].join(',')}`;
}

export function appendSection(output: CompiledConfig, name: string, line: string): void {
  const section = output.sections.find((section) => section.name === name);

  if (section) {
    section.lines.push(line);
  } else {
    output.sections.push({ name, lines: [line] });
  }
}

export function appendValue(output: Source, key: string, value: unknown): void {
  const current: unknown = output[key];

  if (current !== undefined && !Array.isArray(current)) {
    throw new Error(`${key} must be an array`);
  }

  Object.defineProperty(output, key, {
    value: [...(Array.isArray(current) ? current : []), value],
    enumerable: true,
    configurable: true,
    writable: true,
  });
}

export function objectValue(output: Source, key: string): Source {
  if (!Object.hasOwn(output, key)) {
    Object.defineProperty(output, key, { value: {}, enumerable: true, configurable: true, writable: true });
  }

  const value = output[key];

  if (!isRecord(value)) {
    throw new Error(`${key} must be an object`);
  }

  return value;
}

export function rule(entry: BaseRuleset, lowercase = false): string {
  const values = parameters(entry);
  const kind = lowercase ? entry.kind.toLowerCase() : entry.kind;
  const prefix = [kind];

  if (entry.kind !== 'FINAL' && entry.kind !== 'MATCH') {
    const index = values.findIndex((value) => value.type === 'positional');
    const match = index < 0 ? undefined : values.splice(index, 1)[0];

    if (match?.type !== 'positional') {
      throw new Error('Rule match value is required');
    }

    prefix.push(match.value.startsWith('(') ? text(match.value) : atom(match.value));
  }

  if (!entry.name) {
    throw new Error('Rule outlet is required');
  }

  return [...prefix, atom(entry.name), ...values.map(parameter)].join(',');
}

function merge(target: Source, source: Source, path: string[] = []): void {
  for (const [key, value] of Object.entries(source)) {
    const current: unknown = Object.hasOwn(target, key) ? target[key] : undefined;
    let result: unknown;

    if (Array.isArray(value)) {
      const append = ['outbounds', 'endpoints', 'proxy-groups', 'rules', 'route.rules', 'route.rule_set'].includes(
        [...path, key].join('.'),
      );

      if (append && current !== undefined && current !== null && !Array.isArray(current)) {
        throw new Error(`${key} must be an array`);
      }

      result = append
        ? [...(Array.isArray(current) ? current : []), ...structuredClone(value)]
        : structuredClone(value);
    } else if (isRecord(value) && path.length === 1 && path[0] === 'rule-providers') {
      result = { ...(isRecord(current) ? current : {}), ...structuredClone(value) };
    } else if (isRecord(value)) {
      if (current !== undefined && current !== null && !isRecord(current)) {
        throw new Error(`${key} must be an object`);
      }

      const nested: Source = isRecord(current) ? current : {};

      merge(nested, value, [...path, key]);
      result = nested;
    } else {
      result = value;
    }

    Object.defineProperty(target, key, { value: result, enumerable: true, configurable: true, writable: true });
  }
}

export function mergeConfig(document: ParsedTemplate, config: CompiledConfig): void {
  if (document.target !== config.target) {
    throw new ConfigCompileError(document.target, 'Target mismatch');
  }

  if (document.format !== 'ini') {
    merge(document.value, config.value);

    return;
  }

  for (const section of config.sections) {
    const current = document.value.sections.find((entry) => entry.name?.toLowerCase() === section.name?.toLowerCase());

    if (current) {
      current.lines.push(...section.lines);
    } else {
      document.value.sections.push({ ...section, lines: [...section.lines] });
    }
  }
}
