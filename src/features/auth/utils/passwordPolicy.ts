export interface PasswordPolicyChecks {
  has8Chars: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export const PASSWORD_SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'`~/]/;

export function getPasswordPolicyChecks(password: string): PasswordPolicyChecks {
  return {
    has8Chars: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: PASSWORD_SPECIAL_CHAR_REGEX.test(password),
  };
}

export function isPasswordPolicyMet(password: string): boolean {
  const checks = getPasswordPolicyChecks(password);
  return (
    checks.has8Chars &&
    checks.hasUpper &&
    checks.hasLower &&
    checks.hasNumber &&
    checks.hasSpecial
  );
}
