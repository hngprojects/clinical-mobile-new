import {
  completePasswordResetSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '@/features/auth/schemas/auth.schemas';

describe('loginSchema', () => {
  it('passes valid credentials', () => {
    expect(
      loginSchema.safeParse({ email: 'test@example.com', password: 'Password1' }).success,
    ).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(loginSchema.safeParse({ email: 'not-an-email', password: 'Password1' }).success).toBe(
      false,
    );
  });

  it('rejects password under 8 chars', () => {
    expect(loginSchema.safeParse({ email: 'test@example.com', password: 'abc' }).success).toBe(
      false,
    );
  });
});

describe('registerSchema', () => {
  const valid = {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    password: 'Password1',
    confirmPassword: 'Password1',
  };

  it('passes valid registration data', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    expect(registerSchema.safeParse({ ...valid, confirmPassword: 'Different1' }).success).toBe(
      false,
    );
  });

  it('rejects password without uppercase', () => {
    expect(
      registerSchema.safeParse({ ...valid, password: 'password1', confirmPassword: 'password1' })
        .success,
    ).toBe(false);
  });

  it('rejects password without number', () => {
    expect(
      registerSchema.safeParse({ ...valid, password: 'PasswordA', confirmPassword: 'PasswordA' })
        .success,
    ).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('passes valid reset request data', () => {
    expect(resetPasswordSchema.safeParse({ email: 'test@example.com' }).success).toBe(true);
  });

  it('rejects invalid reset request email', () => {
    expect(resetPasswordSchema.safeParse({ email: 'not-an-email' }).success).toBe(false);
  });
});

describe('completePasswordResetSchema', () => {
  const valid = {
    password: 'Password1',
    confirmPassword: 'Password1',
  };

  it('passes valid password reset data', () => {
    expect(completePasswordResetSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects password under 8 chars', () => {
    expect(
      completePasswordResetSchema.safeParse({
        password: 'Pass1',
        confirmPassword: 'Pass1',
      }).success,
    ).toBe(false);
  });

  it('rejects mismatched passwords', () => {
    expect(
      completePasswordResetSchema.safeParse({ ...valid, confirmPassword: 'Different1' }).success,
    ).toBe(false);
  });

  it('rejects password without uppercase', () => {
    expect(
      completePasswordResetSchema.safeParse({
        password: 'password1',
        confirmPassword: 'password1',
      }).success,
    ).toBe(false);
  });

  it('rejects password without number', () => {
    expect(
      completePasswordResetSchema.safeParse({
        password: 'PasswordA',
        confirmPassword: 'PasswordA',
      }).success,
    ).toBe(false);
  });
});
