import type { HttpRequestConfig } from './types';
import { nodeLabel } from '../../utils';

export const definition = { type: 'common.httpRequest', ...nodeLabel('commonNodes.httpRequest.name'), version: 1 };
export const defaultConfig: HttpRequestConfig = {
  method: 'GET',
  url: '',
  headers: [],
  body: '',
  outputFormat: 'TEXT',
};
