export type AuthField = 'name' | 'username' | 'email' | 'identifier' | 'password' | 'confirmPassword';

type AuthErrorMessage =
  | 'auth.shared.invalidCredentials'
  | 'auth.shared.emailTaken'
  | 'auth.shared.usernameTaken'
  | 'auth.shared.usernameInvalid'
  | 'auth.shared.passwordHelp'
  | 'auth.shared.emailInvalid'
  | 'auth.shared.emailNotVerified'
  | 'auth.shared.tooManyRequests';

type AuthError = { message: AuthErrorMessage; fields: AuthField[] };
type AuthErrorFallback = 'auth.signIn.error' | 'auth.signUp.error';

const errors: Record<string, AuthError | undefined> = {
  INVALID_EMAIL_OR_PASSWORD: { message: 'auth.shared.invalidCredentials', fields: ['identifier', 'password'] },
  INVALID_USERNAME_OR_PASSWORD: { message: 'auth.shared.invalidCredentials', fields: ['identifier', 'password'] },
  USER_ALREADY_EXISTS: { message: 'auth.shared.emailTaken', fields: ['email'] },
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: { message: 'auth.shared.emailTaken', fields: ['email'] },
  USERNAME_IS_ALREADY_TAKEN: { message: 'auth.shared.usernameTaken', fields: ['username'] },
  USERNAME_TOO_SHORT: { message: 'auth.shared.usernameInvalid', fields: ['username'] },
  USERNAME_TOO_LONG: { message: 'auth.shared.usernameInvalid', fields: ['username'] },
  INVALID_USERNAME: { message: 'auth.shared.usernameInvalid', fields: ['username'] },
  PASSWORD_TOO_SHORT: { message: 'auth.shared.passwordHelp', fields: ['password'] },
  PASSWORD_TOO_LONG: { message: 'auth.shared.passwordHelp', fields: ['password'] },
  INVALID_EMAIL: { message: 'auth.shared.emailInvalid', fields: ['email'] },
  EMAIL_NOT_VERIFIED: { message: 'auth.shared.emailNotVerified', fields: [] },
  TOO_MANY_REQUESTS: { message: 'auth.shared.tooManyRequests', fields: [] },
};

export function getAuthError(
  error: { code?: string; status?: number },
  fallback: AuthErrorFallback,
): { message: AuthErrorMessage | AuthErrorFallback; fields: AuthField[] } {
  if (error.status === 429) {
    return { message: 'auth.shared.tooManyRequests', fields: [] };
  }

  return errors[error.code ?? ''] ?? { message: fallback, fields: [] };
}
