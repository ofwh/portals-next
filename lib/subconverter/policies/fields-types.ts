export interface PolicyGroupIssue {
  path: (string | number)[];
  code: 'required' | 'integer' | 'httpUrl' | 'duplicateName';
}
