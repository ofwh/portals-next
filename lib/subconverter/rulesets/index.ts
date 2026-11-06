import type { ConfigurationClient } from '@/lib/subconverter/configuration/options';
import { parse as clash } from '@/lib/subconverter/rulesets/parsers/clash';
import { parse as clashr } from '@/lib/subconverter/rulesets/parsers/clashr';
import { parse as loon } from '@/lib/subconverter/rulesets/parsers/loon';
import { parse as quanx } from '@/lib/subconverter/rulesets/parsers/quanx';
import { parse as stash } from '@/lib/subconverter/rulesets/parsers/stash';
import { parse as surfboard } from '@/lib/subconverter/rulesets/parsers/surfboard';
import { parse as surge } from '@/lib/subconverter/rulesets/parsers/surge';
import type { ConfigObject } from '@/lib/subconverter/types/configuration';
import type { RuleSetConfigFields } from '@/lib/subconverter/types/rulesets';

const parsers = { clash, clashr, surge, quanx, loon, surfboard, stash } satisfies Record<
  ConfigurationClient,
  (configuration: ConfigObject) => RuleSetConfigFields[]
>;

export function parse(configuration: ConfigObject, client: ConfigurationClient = 'clash'): RuleSetConfigFields[] {
  return parsers[client](configuration);
}
