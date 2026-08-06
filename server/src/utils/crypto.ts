import crypto from 'crypto';

/**
 * AES-256-GCM field-level encryption for sensitive data (SSNs).
 * Requires ENCRYPTION_KEY in env: a 32-byte key, base64-encoded.
 * Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 */
function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error('ENCRYPTION_KEY is not set. Refusing to handle sensitive data without it.');
  }
  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) {
    throw new Error('ENCRYPTION_KEY must decode to exactly 32 bytes.');
  }
  return key;
}

export function encryptField(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Format: iv:authTag:ciphertext, all base64
  return [iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join(':');
}

export function decryptField(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(':');
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error('Malformed encrypted payload.');
  }
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64')), decipher.final()]);
  return decrypted.toString('utf8');
}

/** Masks an SSN for display, e.g. XXX-XX-1234. Never log/return full SSNs. */
export function maskSsn(ssn: string): string {
  const digits = ssn.replace(/\D/g, '');
  if (digits.length < 4) return 'XXX-XX-XXXX';
  return `XXX-XX-${digits.slice(-4)}`;
}
