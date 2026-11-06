import logger from '@/lib/api/logger';
import { ConfigurationFieldError, integer, rejectImport } from '@/lib/subconverter/configuration/fields';
import { defaultRuleInterval, ruleSourceFormats } from '@/lib/subconverter/rulesets/options';
import type {
  RuleGroupFields,
  RuleResourceFormat,
  RuleSetConfigFields,
  RuleSourceFormat,
} from '@/lib/subconverter/types/rulesets';
import type { RuleSetConfigNode } from '@/lib/subconverter/types/rulesets';

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
    logger.warn('Unsupported ruleset type', { field: 'type', data: type });

    throw new ConfigurationFieldError('type', 'Unsupported ruleset type');
  }

  return format;
}

export function transform(nodes: readonly (string | RuleSetConfigNode)[]): RuleSetConfigFields[] {
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
        throw new ConfigurationFieldError('rulesets', 'Missing policy or rule source');
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
        logger.warn('rule and ruleset are mutually exclusive', { field: 'rulesets', data: node });

        throw new ConfigurationFieldError('rulesets', 'rule and ruleset are mutually exclusive');
      }

      if (node.rule !== undefined) {
        if (node.type !== undefined || node.options !== undefined) {
          throw new ConfigurationFieldError('rulesets', 'Remote source fields cannot be used with an inline rule');
        }

        interval = integer(node.interval, 'interval', defaultRuleInterval);
        result.push({ type: 'inline', policy, rule: node.rule, interval });
        continue;
      }

      if (node.ruleset === undefined) {
        throw new ConfigurationFieldError('rulesets', 'Missing rule or ruleset');
      }

      source = node.ruleset;
      interval = integer(node.interval, 'interval', defaultRuleInterval);
      options = node.options ?? [];
      explicitFormat = node.type === undefined ? undefined : sourceFormat(node.type);
    }

    rejectImport(source);

    if (source.startsWith('[]')) {
      if (options.length || explicitFormat !== undefined) {
        throw new ConfigurationFieldError('rulesets', 'Remote source fields cannot be used with an inline rule');
      }

      result.push({ type: 'inline', policy, rule: source.slice(2), interval });
      continue;
    }

    let noResolve = false;
    let resourceFormat: RuleResourceFormat | undefined;

    for (const raw of options) {
      const option = raw.trim().toLowerCase();

      if (option === 'no-resolve') {
        noResolve = true;
        continue;
      }

      if (option.startsWith('stash-format=')) {
        const format = option.slice('stash-format='.length);

        if (format === 'yaml' || format === 'text' || format === 'mrs') {
          if (resourceFormat && resourceFormat !== format) {
            logger.warn('Conflicting rule resource formats', { field: 'options', data: raw });

            throw new ConfigurationFieldError('options', 'Conflicting rule resource formats');
          }

          resourceFormat = format;
          continue;
        }
      }

      throw new ConfigurationFieldError('options', 'Unsupported rule option');
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
