import { POLICY_ERROR_CODES } from '../../shared/errors';
import { isRecord } from '../../shared/text';
import type { SurgePolicyPath } from '../../types/policy';
import { EntryError } from '../diagnostics';
import type { GroupDeclaration } from '../resolvers/types';

export function isSurgePolicyPath(value: unknown): value is SurgePolicyPath {
  if (
    !isRecord(value) ||
    Object.keys(value).some((key) => !['url', 'pattern', 'interval'].includes(key)) ||
    typeof value.url !== 'string' ||
    !/^https?:\/\//i.test(value.url) ||
    /[,"\\\s\x00-\x1f\x7f]/.test(value.url) ||
    (value.pattern !== undefined &&
      (typeof value.pattern !== 'string' || !value.pattern || /[\x00-\x1f\x7f]/.test(value.pattern))) ||
    (value.interval !== undefined &&
      (typeof value.interval !== 'number' || !Number.isSafeInteger(value.interval) || value.interval <= 0))
  ) {
    return false;
  }

  try {
    const url = new URL(value.url);

    if (value.pattern !== undefined) {
      new RegExp(value.pattern);
    }

    return !url.username && !url.password;
  } catch {
    return false;
  }
}

export function readSurgePolicyPath(declaration: GroupDeclaration): GroupDeclaration {
  const options = declaration.syntax === 'delimited' ? declaration.flags : declaration.fields;

  if (!options || !Object.hasOwn(options, 'policy-path')) {
    return declaration;
  }

  const { 'policy-path': url, 'policy-regex-filter': pattern, 'update-interval': interval, ...flags } = options;
  const policyPath = {
    url,
    ...(pattern !== undefined ? { pattern } : {}),
    ...(interval !== undefined ? { interval } : {}),
  };

  if (declaration.kind === 'ssid' || !isSurgePolicyPath(policyPath)) {
    throw new EntryError(POLICY_ERROR_CODES.INVALID_POLICY_OPTIONS, 'policy-path');
  }

  return {
    ...declaration,
    policyPath,
    ...(declaration.syntax === 'delimited' ? { flags: Object.keys(flags).length ? flags : undefined } : {}),
  };
}
