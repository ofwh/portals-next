import type { ConfigurationClient } from '@/lib/subconverter/configuration/options';
import { parse as clash } from '@/lib/subconverter/policies/parsers/clash';
import { parse as clashr } from '@/lib/subconverter/policies/parsers/clashr';
import { parse as loon } from '@/lib/subconverter/policies/parsers/loon';
import { parse as quanx } from '@/lib/subconverter/policies/parsers/quanx';
import { parse as stash } from '@/lib/subconverter/policies/parsers/stash';
import { parse as surfboard } from '@/lib/subconverter/policies/parsers/surfboard';
import { parse as surge } from '@/lib/subconverter/policies/parsers/surge';
import type { ConfigObject } from '@/lib/subconverter/types/configuration';
import type { PolicyConfigFields } from '@/lib/subconverter/types/policies';

const parsers = { clash, clashr, surge, quanx, loon, surfboard, stash } satisfies Record<
  ConfigurationClient,
  (configuration: ConfigObject) => PolicyConfigFields[]
>;

export function parse(configuration: ConfigObject, client: ConfigurationClient = 'clash'): PolicyConfigFields[] {
  return parsers[client](configuration);
}
