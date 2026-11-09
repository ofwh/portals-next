import { rulesFor, textRule } from './shared';
import { ruleDelivery } from '../../../shared/compile';
import type { IniDocument } from '../../../types/template';
import { warn } from '../../diagnostics';
import type { CompileContext } from '../../types';
import { writeSection } from '../shared';

export function iniRules(context: CompileContext, document: IniDocument): void {
  const target = context.target;
  const section = target === 'quanx' ? 'filter_local' : target === 'mellow' ? 'RoutingRule' : 'Rule';

  if (context.options.overwriteOriginalRules) {
    writeSection(document, section, [], true);
    if (target === 'quanx') {
      writeSection(document, 'filter_remote', [], true);
    }

    if (target === 'loon') {
      writeSection(document, 'Remote Rule', [], true);
    }
  }

  const output: string[] = [];

  for (const [index, ruleset] of context.rulesets.entries()) {
    const delivery = ruleDelivery(target, ruleset);

    if (delivery === 'skip') {
      warn(context, 'UNSUPPORTED_RULE', 'rulesets', index);
      continue;
    }

    if (delivery === 'remote' && ruleset.source.kind === 'resource') {
      const address = ruleset.source.address;

      if (target === 'surge') {
        if (ruleset.category === 'surge') {
          output.push(
            `RULE-SET,${address},${ruleset.group}${ruleset.interval ? `,update-interval=${ruleset.interval}` : ''}`,
          );
        } else {
          warn(context, 'UNSUPPORTED_RULE', 'rulesets', index);
        }

        continue;
      }

      if (target === 'quanx' && ruleset.category === 'quanx') {
        writeSection(document, 'filter_remote', [
          `${address}, tag=${ruleset.group}, force-policy=${ruleset.group}, enabled=true`,
        ]);
        continue;
      }

      if (target === 'loon') {
        writeSection(document, 'Remote Rule', [`${address},${ruleset.group}`]);
        continue;
      }
    }

    for (const rule of rulesFor(context, ruleset, index)) {
      const value = textRule(context, rule, ruleset, ruleset.source.kind === 'inline', index);

      if (value !== undefined) {
        output.push(value);
      }
    }
  }
  writeSection(document, section, output);
}
