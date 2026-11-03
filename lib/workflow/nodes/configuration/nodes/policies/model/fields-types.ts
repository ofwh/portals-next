export type PolicyGroupType = 'select' | 'url-test' | 'fallback' | 'load-balance' | 'relay' | 'ssid' | 'smart';

export type PolicyGroupMember = { type: 'reference' | 'selector'; value: string };

export interface PolicyGroupFields {
  name: string;
  type: PolicyGroupType;
  members: PolicyGroupMember[];
  providers: string[];
  url?: string;
  interval?: number;
  timeout?: number;
  tolerance?: number;
}

export interface PolicyGroupIssue {
  path: (string | number)[];
  code: 'required' | 'integer' | 'httpUrl' | 'duplicateName';
}
