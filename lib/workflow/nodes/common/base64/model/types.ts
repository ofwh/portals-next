export type Base64Mode = 'encode' | 'decode';

export interface Base64Config {
  mode: Base64Mode;
}

export type Base64Input = string;
export type Base64Output = string;
