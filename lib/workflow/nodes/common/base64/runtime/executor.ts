import 'server-only';
import base64Service from './service';
import type { ExecutionContext } from '../../../types';
import type { Base64Config, Base64Input, Base64Output } from '../model/types';

export async function execute(
  input: Base64Input,
  config: Base64Config,
  context: ExecutionContext,
): Promise<Base64Output> {
  return base64Service.convert(input, config, context);
}
