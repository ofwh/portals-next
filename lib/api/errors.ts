import { BUSINESS_ERROR_CODE } from '@/lib/errors';
import type { BusinessErrorCode } from '@/lib/errors';
import { ERROR_CODE as COMMON_ERROR_CODE } from './codes';
import type { CommonErrorCode } from './codes';

export const ERROR_CODE = { ...COMMON_ERROR_CODE, ...BUSINESS_ERROR_CODE } as const;

export type ErrorCode = CommonErrorCode | BusinessErrorCode;
export type ErrorParams = Record<string, string | number>;

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly params?: ErrorParams,
  ) {
    super(code);
    this.name = 'AppError';
  }
}

export function appError(code: ErrorCode, params?: ErrorParams): AppError {
  return new AppError(code, params);
}

export function businessCode(code: ErrorCode): number {
  for (const [namespace, codes] of Object.entries(ERROR_CODE)) {
    for (const [key, value] of Object.entries(codes)) {
      if (`${namespace}.${key}` === code) {
        return value;
      }
    }
  }

  return COMMON_ERROR_CODE.common.INTERNAL_ERROR;
}
