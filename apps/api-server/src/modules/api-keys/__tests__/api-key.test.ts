import { describe, it, expect } from 'vitest';
import { generateApiKey, hashApiKey } from '../../../utils/api-key.js';

describe('API Key Utility', () => {
  it('should generate a valid API key with qf_live_ prefix and SHA-256 hash', () => {
    const { rawKey, prefix, hash } = generateApiKey();

    expect(prefix).toMatch(/^qf_live_[a-f0-9]{8}$/);
    expect(rawKey.startsWith(prefix)).toBe(true);
    expect(hash.length).toBe(64); // SHA-256 hex output length

    const computedHash = hashApiKey(rawKey);
    expect(computedHash).toBe(hash);
  });
});
