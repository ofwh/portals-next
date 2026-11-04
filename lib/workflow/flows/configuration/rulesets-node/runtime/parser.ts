import type { ConfigObject } from '@/lib/subconverter/types/configuration';
import type { RuleGroupFields, RuleResourceFormat, RuleSourceFormat } from '@/lib/subconverter/types/rulesets';
import type { RuleSetConfigFields } from '@/lib/subconverter/types/rulesets';
import { readRulesetNodes } from './dataset';
import { ConfigurationFieldError, integer, rejectImport } from '../../utils/configuration';
import { defaultRuleInterval, ruleSourceFormats } from '../model/options';
import type { RuleSetConfigNode } from '../model/types';

function adaptObject(original: RuleSetConfigNode, toml: boolean): RuleSetConfigNode {
  const node = { ...original };

  if (toml) {
    if (node.ruleset === undefined) {
      throw new ConfigurationFieldError('ruleset', 'Required');
    }

    node.type ??= 'surge-ruleset';
    delete node.rule;
  } else {
    delete node.type;
    // YAML readRuleset 优先非空远程来源，缺失时才使用内联规则。
    if (node.ruleset) {
      delete node.rule;
    } else {
      delete node.ruleset;
    }

    if (!node.rule) {
      delete node.rule;
    }
  }

  return node;
}

function sourceFormat(type: string): RuleSourceFormat {
  if (type === 'surge-ruleset') {
    return 'surge';
  }

  if (type === 'quantumultx') {
    return 'quanx';
  }

  const format = ruleSourceFormats.find(
    (candidate) => candidate !== 'surge' && candidate !== 'quanx' && candidate === type,
  );

  if (!format) {
    throw new ConfigurationFieldError('type', 'Unsupported ruleset type');
  }

  return format;
}

function transform(nodes: readonly (string | RuleSetConfigNode)[]): RuleSetConfigFields[] {
  const result: RuleGroupFields[] = [];

  for (const node of nodes) {
    let policy: string;
    let source: string;
    let interval = defaultRuleInterval;
    let options: readonly string[] = [];
    let explicitFormat: RuleSourceFormat | undefined;

    if (typeof node === 'string') {
      const first = node.indexOf(',');

      if (first < 0) {
        continue;
      }

      policy = node.slice(0, first);
      source = node.slice(first + 1);

      if (!source.startsWith('[]')) {
        const last = node.lastIndexOf(',');

        if (last !== first) {
          const [time, ...rawOptions] = node.slice(last + 1).split('|');

          interval = integer(time, 'interval');
          options = rawOptions;
          source = node.slice(first + 1, last);
        }
      }
    } else {
      policy = node.group;

      if (node.rule !== undefined && node.ruleset !== undefined) {
        throw new ConfigurationFieldError('rulesets', 'rule and ruleset are mutually exclusive');
      }

      if (node.rule !== undefined) {
        interval = integer(node.interval, 'interval', defaultRuleInterval);
        result.push({ type: 'inline', policy, rule: node.rule, interval });
        continue;
      }

      if (node.ruleset === undefined) {
        continue;
      }

      source = node.ruleset;
      interval = integer(node.interval, 'interval', defaultRuleInterval);
      options = node.options ?? [];
      explicitFormat = node.type === undefined ? undefined : sourceFormat(node.type);
    }

    rejectImport(source);

    if (source.startsWith('[]')) {
      result.push({ type: 'inline', policy, rule: source.slice(2), interval });
      continue;
    }

    let noResolve = false;
    let resourceFormat: RuleResourceFormat | undefined;

    for (const raw of options) {
      const option = raw.trim().toLowerCase();

      if (option === 'no-resolve') {
        noResolve = true;
      }

      if (option.startsWith('stash-format=')) {
        const format = option.slice('stash-format='.length);

        if (format === 'yaml' || format === 'text' || format === 'mrs') {
          if (resourceFormat && resourceFormat !== format) {
            throw new ConfigurationFieldError('options', 'Conflicting rule resource formats');
          }

          resourceFormat = format;
        }
      }
    }

    const prefix = ruleSourceFormats.find((candidate) => source.startsWith(`${candidate}:`));

    const format = explicitFormat ?? prefix ?? 'surge';
    const url = !explicitFormat && prefix ? source.slice(prefix.length + 1) : source;

    result.push({
      type: 'remote',
      policy,
      url,
      format,
      interval,
      noResolve,
      ...(resourceFormat ? { resourceFormat } : {}),
    });
  }

  return result;
}

export function parse(configuration: ConfigObject): RuleSetConfigFields[] {
  const { nodes, toml } = readRulesetNodes(configuration);

  return transform(nodes.map((node) => (typeof node === 'string' ? node : adaptObject(node, toml))));
}
