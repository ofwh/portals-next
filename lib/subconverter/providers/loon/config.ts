import type { LoonConfig } from '../../types/loon';
import type { ProviderStringOptions } from '../provider';

export function parse(content: string): LoonConfig {
  const config: LoonConfig = {};
  let section = 'Proxy';
  const sections: Record<string, string[]> = {};

  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();

    if (!line || /^[#;]/.test(line)) {
      continue;
    }

    if (/^\[.*\]$/.test(line)) {
      section = line.slice(1, -1);
      continue;
    }

    (sections[section] ??= []).push(line);
  }
  Object.assign(config, sections);

  return config;
}

export function toString(_config: LoonConfig, _options?: ProviderStringOptions): string {
  throw new Error('Provider serialization is not implemented');
}
