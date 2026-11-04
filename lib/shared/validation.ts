export function validPathname(value: string): boolean {
  return /^\/[a-zA-Z0-9_./-]+$/.test(value) && !value.endsWith('/');
}

export function validUrl(value: string): boolean {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function validJson(value: string): boolean {
  try {
    JSON.parse(value);

    return true;
  } catch {
    return false;
  }
}
