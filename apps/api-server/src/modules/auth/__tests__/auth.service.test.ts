import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../../../utils/password.js';

describe('Password Utility', () => {
  it('should hash password and verify successfully', async () => {
    const password = 'SuperSecretPassword123!';
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(20);

    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);

    const isWrongValid = await verifyPassword('WrongPassword', hash);
    expect(isWrongValid).toBe(false);
  });
});
