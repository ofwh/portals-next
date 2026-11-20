import { CONFIG_TYPES } from '../../../shared';
import type { BaseCustomConfig, ConfigDeclaration } from '../../../types';
import {
  appendSection,
  atom,
  bind,
  defineConfig,
  namedOnly,
  options,
  parameter,
  positional,
  proxyGroup,
  quote,
  rule,
} from '../../shared/config';
import { ruleValue } from '../../shared/ini';
import type { CompiledConfig } from '../../types';
import { BUILTIN_REFERENCES } from '../shared';

type CustomMode = (entry: BaseCustomConfig, output: CompiledConfig) => void;

function remoteFilter(entry: BaseCustomConfig, output: CompiledConfig): void {
  const { name, mode, subscription, FilterKey, ...rest } = namedOnly(entry);

  if (typeof name !== 'string' || !name.trim() || typeof mode !== 'string' || !mode.trim()) {
    throw new Error('Remote Filter name and mode are required');
  }

  const subscriptions = subscription === undefined ? [] : Array.isArray(subscription) ? subscription : [subscription];
  const values = [
    atom(mode),
    ...subscriptions.map(atom),
    ...(FilterKey === undefined ? [] : [`FilterKey=${quote(FilterKey)}`]),
    ...Object.entries(rest).map(([key, value]) => `${atom(key)}=${atom(value)}`),
  ];

  appendSection(output, 'Remote Filter', `${atom(name)} = ${values.join(',')}`);
}

function plugin(entry: BaseCustomConfig, output: CompiledConfig): void {
  const { url, ...fields } = namedOnly(entry);

  if (typeof url !== 'string' || !url.trim()) {
    throw new Error('Plugin url is required');
  }

  appendSection(
    output,
    'Plugin',
    [atom(url), ...Object.entries(fields).map(([key, value]) => `${atom(key)}=${atom(value)}`)].join(','),
  );
}

const CUSTOM_MODES = new Map<string, CustomMode>([
  ['REMOTE_FILTER', remoteFilter],
  ['PLUGIN', plugin],
]);

function customReferences(config: readonly ConfigDeclaration[]): string[] {
  return config.flatMap((declaration) => {
    if (declaration.type !== CONFIG_TYPES.CUSTOM || declaration.value.kind !== 'REMOTE_FILTER') {
      return [];
    }

    const { name } = options(declaration.value);

    return typeof name === 'string' ? [name] : [];
  });
}

export const config = defineConfig(
  'loon',
  (declaration, output) => {
    if (declaration.type === CONFIG_TYPES.PROXY_GROUP) {
      appendSection(
        output,
        'Proxy Group',
        proxyGroup(declaration.value, {
          encode: atom,
          formatParameter: (value) =>
            declaration.value.kind === 'ssid' &&
            value.type === 'named' &&
            !['default', 'cellular', 'img-url'].includes(value.name)
              ? `${quote(value.name)}=${atom(value.value)}`
              : parameter(value, atom),
        }),
      );
    } else if (declaration.type === CONFIG_TYPES.RULESET) {
      const entry = declaration.value;

      if (declaration.value.kind !== 'RULE-SET') {
        appendSection(
          output,
          'Rule',
          rule(declaration.value, {
            encode: atom,
            encodeMatch: ruleValue,
            match: !['FINAL', 'MATCH'].includes(declaration.value.kind),
          }),
        );

        return;
      }

      const values = positional(entry);
      const fields = options(entry);

      if (entry.name || Object.hasOwn(fields, 'policy')) {
        bind(fields, 'policy', entry.name);
      }

      if (!entry.name) {
        delete fields.policy;
      }

      appendSection(
        output,
        'Remote Rule',
        [...values.map(atom), ...Object.entries(fields).map(([key, value]) => `${atom(key)}=${atom(value)}`)].join(','),
      );
    } else {
      const entry = declaration.value;
      const convert = CUSTOM_MODES.get(entry.kind);

      if (!convert) {
        throw new Error(`Unsupported custom mode: ${entry.kind}`);
      }

      convert(entry, output);
    }
  },
  {
    references: (config) => [...BUILTIN_REFERENCES, ...customReferences(config)],
    expandGroup: (entry) => !['ssid', 'subnet'].includes(entry.kind),
    memberParameters: ['proxies', 'outbounds'],
  },
);
