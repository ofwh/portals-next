import type { ConfigType } from './types';

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
