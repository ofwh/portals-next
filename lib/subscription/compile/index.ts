import { CompileError } from './diagnostics';
import { compileTransformers, isCompileTarget } from './transformers';
import type { CompileContext } from './types';
import { proxyGroupType } from '../schemas/policy';
import { proxyNodeType } from '../schemas/proxy-node';
import { ruleSetType } from '../schemas/ruleset';
import { templateType } from '../schemas/template';
import type { CompileDiagnostic, CompileOptions, CompileParams, CompileResult } from '../types/compile';

export function compile(input: CompileParams, options: CompileOptions = {}): CompileResult {
  const diagnostics: CompileDiagnostic[] = [];
  const failure = (error: CompileError): CompileResult => ({
    ok: false,
    error: {
      module: 'compile',
      severity: 'error',
      target: String(input?.target ?? ''),
      code: error.code,
      ...(error.field ? { field: error.field } : {}),
      ...(error.index !== undefined ? { index: error.index } : {}),
    },
    diagnostics,
  });

  if (!isCompileTarget(input?.target)) {
    return failure(new CompileError('INVALID_TARGET', 'target'));
  }

  const transformer = compileTransformers[input.target];

  try {
    if (
      !Array.isArray(input.nodes) ||
      !Array.isArray(input.groups) ||
      !Array.isArray(input.rulesets) ||
      (options !== undefined &&
        (options === null ||
          typeof options !== 'object' ||
          Array.isArray(options) ||
          Object.entries(options).some(
            ([key, value]) =>
              !['enableRuleGenerator', 'overwriteOriginalRules'].includes(key) || typeof value !== 'boolean',
          ))) ||
      (input.resources !== undefined &&
        (input.resources === null ||
          typeof input.resources !== 'object' ||
          Array.isArray(input.resources) ||
          Object.values(input.resources).some((value) => typeof value !== 'string')))
    ) {
      throw new CompileError('INVALID_INPUT');
    }

    input.nodes.forEach((node) => proxyNodeType.parse(node));
    if (transformer.format !== 'uri') {
      input.groups.forEach((group) => proxyGroupType.parse(group));
      if (input.target !== 'singbox') {
        const index = input.groups.findIndex(
          (group) => group.healthCheck !== undefined && group.healthCheck.url === undefined,
        );

        if (index !== -1) {
          throw new CompileError('INVALID_INPUT', 'groups.healthCheck.url', index);
        }
      }

      input.rulesets.forEach((ruleset) => ruleSetType.parse(ruleset));
      if (input.target !== 'singbox' && options?.enableRuleGenerator !== false) {
        const index = input.rulesets.findIndex(
          (ruleset) =>
            ruleset.category === 'singbox' ||
            (ruleset.source.kind === 'inline' &&
              (ruleset.source.rule.type === 'PRIVATE' ||
                (ruleset.source.rule.type === 'RULE-SET' && ruleset.source.rule.parameters.length > 1))),
        );

        if (index !== -1) {
          throw new CompileError('UNSUPPORTED_RULE', 'rulesets', index);
        }
      }

      if (input.groups.some((group) => group.providerRefs.length)) {
        throw new CompileError('INVALID_INPUT', 'groups.providerRefs');
      }

      if (!input.template || input.template.format !== transformer.format) {
        throw new CompileError('INVALID_TEMPLATE', 'template');
      }

      try {
        templateType.parse(input.template);
      } catch {
        throw new CompileError('INVALID_TEMPLATE', 'template');
      }
    }
  } catch (error) {
    return failure(error instanceof CompileError ? error : new CompileError('INVALID_INPUT'));
  }
  try {
    const context: CompileContext = {
      ...structuredClone(input),
      protocols: transformer.protocols,
      options: {
        enableRuleGenerator: options?.enableRuleGenerator ?? true,
        overwriteOriginalRules: options?.overwriteOriginalRules ?? false,
      },
      diagnostics,
    };
    const content = transformer.compile(context);
    const contentType =
      transformer.format === 'yaml'
        ? 'text/yaml; charset=utf-8'
        : transformer.format === 'json'
          ? 'application/json; charset=utf-8'
          : 'text/plain; charset=utf-8';

    return { ok: true, content, contentType, diagnostics };
  } catch (error) {
    return failure(error instanceof CompileError ? error : new CompileError('SERIALIZATION_FAILED'));
  }
}

export { compileTransformers, compileTargetOptions, isCompileTarget } from './transformers';
export type { CompileTransformer } from './types';
export type { CompileTarget, CompileOptions, CompileParams, CompileResult, CompileDiagnostic } from '../types/compile';

const service = { compile };

export default service;
