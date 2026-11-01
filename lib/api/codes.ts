export const ERROR_CODE = {
  common: {
    INVALID_PARAMS: 1000,
    UNAUTHORIZED: 1001,
    FORBIDDEN: 1002,
    NOT_FOUND: 1003,
    TOO_MANY_REQUESTS: 1004,
    INTERNAL_ERROR: 1005,
    BAD_GATEWAY: 1006,
    REQUEST_FAILED: 1007,
  },
} as const;

export type CommonErrorCode = `common.${keyof typeof ERROR_CODE.common}`;
