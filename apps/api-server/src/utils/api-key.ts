import crypto from 'crypto';

export interface GeneratedApiKey {
  rawKey: string;
  prefix: string;
  hash: string;
}

export function generateApiKey(): GeneratedApiKey {
  const prefix = 'qf_live_' + crypto.randomBytes(4).toString('hex');
  const secret = crypto.randomBytes(24).toString('hex');
  const rawKey = `${prefix}_${secret}`;
  
  const hash = crypto.createHash('sha256').update(rawKey).digest('hex');

  return { rawKey, prefix, hash };
}

export function hashApiKey(rawKey: string): string {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}
