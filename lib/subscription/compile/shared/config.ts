import { isRecord } from '@/lib/shared/data';
import { createGroupResolver } from './members';
import { CONFIG_TYPES } from '../../shared';
import type { BaseProxyGroup, BaseRuleset, ConfigDeclaration, ConfigParameter } from '../../types';
import type {
  CompiledConfig,
  CompiledNode,
  ConfigModule,
  ParsedTemplate,
  Source,
  SubscriptionType,
  TemplateTarget,
} from '../types';

type ValueEncoder = (value: unknown) => string;
type RuleOptions = { lowercase?: boolean; encode?: ValueEncoder; encodeMatch?: ValueEncoder; match?: boolean };
type GroupOptions = {
  encode?: ValueEncoder;
  formatParameter?: (value: ConfigParameter) => string;
  nameFirst?: boolean;
};
type ConfigOptions = {
  references?: (config: readonly ConfigDeclaration[]) => readonly string[];
  nodeName?: (node: CompiledNode) => unknown;
  expandGroup?: (entry: BaseProxyGroup) => boolean;
  memberParameters?: readonly string[];
};
export type MergeOptions = { appendArrays?: readonly string[]; shallowObjects?: readonly string[] };

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
  settings: ConfigOptions = {},
): ConfigModule {
  return {
    compileConfig(config = [], nodes = []) {
      const output: CompiledConfig = { target, value: {}, sections: [] };
      const names = nodes.flatMap((node) => {
        const name = settings.nodeName ? settings.nodeName(node) : node.value.name;

        return typeof name === 'string' ? [name] : [];
      });
      const references = config.flatMap((declaration) =>
        declaration.type === CONFIG_TYPES.PROXY_GROUP ? [declaration.value.name] : [],
      );
      const resolveGroup = createGroupResolver(
        names,
        [...references, ...(settings.references?.(config) ?? [])],
        settings.memberParameters,
      );

      for (const [index, declaration] of config.entries()) {
        try {
          convert(
            declaration.type === CONFIG_TYPES.PROXY_GROUP && settings.expandGroup?.(declaration.value) !== false
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

export function parameters(entry: Pick<ConfigDeclaration['value'], 'parameters'>): ConfigParameter[] {
  return entry.parameters.map((parameter) => ({ ...parameter }));
}

export function options(entry: Pick<ConfigDeclaration['value'], 'parameters'>): Source {
  return Object.fromEntries(
    parameters(entry).flatMap((parameter) => (parameter.type === 'named' ? [[parameter.name, parameter.value]] : [])),
  );
}

export function positional(entry: Pick<ConfigDeclaration['value'], 'parameters'>): string[] {
  return parameters(entry).flatMap((parameter) => (parameter.type === 'positional' ? [parameter.value] : []));
}

export function namedOnly(entry: Pick<ConfigDeclaration['value'], 'parameters'>): Source {
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

export function parameter(value: ConfigParameter, encode: ValueEncoder = text): string {
  return value.type === 'positional' ? encode(value.value) : `${encode(value.name)}=${encode(value.value)}`;
}

export function proxyGroup(
  entry: BaseProxyGroup,
  { encode = text, formatParameter, nameFirst = true }: GroupOptions = {},
): string {
  const values = parameters(entry).map((value) =>
    formatParameter ? formatParameter(value) : parameter(value, encode),
  );
  const [left, right] = nameFirst ? [entry.name, entry.kind] : [entry.kind, entry.name];

  return `${encode(left)} = ${[encode(right), ...values].join(',')}`;
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

export function rule(
  entry: BaseRuleset,
  { lowercase = false, encode = text, encodeMatch = encode, match: hasMatch = true }: RuleOptions = {},
): string {
  const values = parameters(entry);
  const kind = lowercase ? entry.kind.toLowerCase() : entry.kind;
  const prefix = [kind];

  if (hasMatch) {
    const index = values.findIndex((value) => value.type === 'positional');
    const match = index < 0 ? undefined : values.splice(index, 1)[0];

    if (match?.type !== 'positional') {
      throw new Error('Rule match value is required');
    }

    prefix.push(encodeMatch(match.value));
  }

  if (!entry.name) {
    throw new Error('Rule outlet is required');
  }

  return [...prefix, encode(entry.name), ...values.map((value) => parameter(value, encode))].join(',');
}

function merge(target: Source, source: Source, settings: MergeOptions, path: string[] = []): void {
  for (const [key, value] of Object.entries(source)) {
    const current: unknown = Object.hasOwn(target, key) ? target[key] : undefined;
    let result: unknown;

    if (Array.isArray(value)) {
      const append = settings.appendArrays?.includes([...path, key].join('.')) ?? false;

      if (append && current !== undefined && current !== null && !Array.isArray(current)) {
        throw new Error(`${key} must be an array`);
      }

      result = append
        ? [...(Array.isArray(current) ? current : []), ...structuredClone(value)]
        : structuredClone(value);
    } else if (isRecord(value) && settings.shallowObjects?.includes(path.join('.'))) {
      result = { ...(isRecord(current) ? current : {}), ...structuredClone(value) };
    } else if (isRecord(value)) {
      if (current !== undefined && current !== null && !isRecord(current)) {
        throw new Error(`${key} must be an object`);
      }

      const nested: Source = isRecord(current) ? current : {};

      merge(nested, value, settings, [...path, key]);
      result = nested;
    } else {
      result = value;
    }

    Object.defineProperty(target, key, { value: result, enumerable: true, configurable: true, writable: true });
  }
}

export function mergeConfig(document: ParsedTemplate, config: CompiledConfig, settings: MergeOptions = {}): void {
  if (document.target !== config.target) {
    throw new ConfigCompileError(document.target, 'Target mismatch');
  }

  if (document.format !== 'ini') {
    merge(document.value, config.value, settings);

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
