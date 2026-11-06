import 'server-only';
import { appError } from '@/lib/api';
import type { ErrorParams } from '@/lib/api';
import { generate } from '@/lib/subconverter/output';
import { OutputError } from '@/lib/subconverter/output/shared/errors';
import type { ExecutionContext } from '@/lib/workflow/node/types';
import { generationErrorDetails } from '../../i18n/generation-errors';
import { outputFormatLabels } from '../model/definition';
import type { GenerateSubscriptionConfig, GenerateSubscriptionElements } from '../model/types';

export async function execute(
  input: GenerateSubscriptionElements,
  config: GenerateSubscriptionConfig,
  context: ExecutionContext,
): Promise<string> {
  context.signal.throwIfAborted();
  try {
    const artifact = await generate(
      config.format,
      {
        nodes: input.nodes ?? [],
        rules: input.rulesets ?? [],
        policies: input.policies ?? [],
        template: input.template,
      },
      context.signal,
    );

    return artifact.content;
  } catch (error) {
    context.signal.throwIfAborted();
    const failure = error instanceof OutputError ? error : undefined;

    const params: ErrorParams = {
      target: outputFormatLabels[config.format],
      field: failure?.field ?? 'config',
    };

    for (const [locale, suffix] of [
      ['zh-CN', 'Zh'],
      ['en', 'En'],
    ] as const) {
      const details = generationErrorDetails[locale];
      const reasons: Readonly<Record<string, string>> = details.reasons;
      const index = failure?.index;

      params[`stage${suffix}`] = details.stages[failure?.stage ?? 'assembly'];
      params[`position${suffix}`] =
        index !== undefined && Number.isSafeInteger(index) && index >= 0
          ? details.position.replace('{index}', String(index + 1))
          : details.unknownPosition;
      params[`reason${suffix}`] =
        failure && Object.hasOwn(reasons, failure.message) ? reasons[failure.message] : details.unknownReason;
    }

    const generationFailure = appError('workflow.SUBSCRIPTION_GENERATE_FAILED', params);

    throw generationFailure;
  }
}
