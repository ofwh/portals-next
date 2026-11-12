import { loonRules } from './loon';
import { quanxTextRule } from './quanx';
import { rulesFor } from './shared';
import { surfboardTextRule } from './surfboard';
import { surgeTextRule } from './surge';
import { ruleDelivery } from '../../../shared/compile';
import type { IniDocument } from '../../../types/template';
import { warn } from '../../diagnostics';
import type { CompileContext } from '../../types';
import { writeSection } from '../shared';

const textRules: Partial<Record<CompileContext['target'], typeof surgeTextRule>> = {
  quanx: quanxTextRule,
  surfboard: surfboardTextRule,
  surge: surgeTextRule,
};

export function iniRules(context: CompileContext, document: IniDocument): void {
  const target = context.target;

  if (target === 'loon') {
    loonRules(context, document);

    return;
  }

  const section = target === 'quanx' ? 'filter_local' : 'Rule';

  if (context.options.overwriteOriginalRules) {
    writeSection(document, section, [], true);
    if (target === 'quanx') {
      writeSection(document, 'filter_remote', [], true);
    }
  }

  const textRule = textRules[target] ?? surgeTextRule;
  const output: string[] = [];

  for (const [index, ruleset] of context.rulesets.entries()) {
    const delivery = ruleDelivery(target, ruleset);

    if (delivery === 'skip') {
      warn(context, 'UNSUPPORTED_RULE', 'rulesets', index);
      continue;
    }

    if (delivery === 'remote' && ruleset.source.kind === 'resource') {
      const address = ruleset.source.address;

      if (target === 'surge' || target === 'surfboard') {
        output.push(
          `RULE-SET,${address},${ruleset.group}${ruleset.interval ? `,update-interval=${ruleset.interval}` : ''}`,
        );
        continue;
      }

      if (target === 'quanx' && ruleset.category === 'quanx') {
        writeSection(document, 'filter_remote', [
          `${address}, tag=${ruleset.group}, force-policy=${ruleset.group}, enabled=true`,
        ]);
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
