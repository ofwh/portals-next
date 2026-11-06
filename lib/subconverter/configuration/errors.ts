import type { ConfigType } from '../types/configuration';

export class ConfigParameterError extends TypeError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigParameterError';
  }
}

export class ConfigSyntaxError extends SyntaxError {
  constructor(
    public readonly type: ConfigType,
    public readonly line: number,
    public readonly column: number,
    message: string,
  ) {
    super(message);
    this.name = 'ConfigSyntaxError';
  }
}

export class ConfigurationFieldError extends Error {
  constructor(
    public readonly field: string,
    message: string,
  ) {
    super(`${field}: ${message}`);
    this.name = 'ConfigurationFieldError';
  }
}
