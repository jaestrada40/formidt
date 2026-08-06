import { authenticator } from 'otplib';
import qrcode from 'qrcode';

const ISSUER = 'Enrollment Portal';

export function generateMfaSecret(): string {
  return authenticator.generateSecret();
}

export async function generateMfaQrCode(email: string, secret: string): Promise<string> {
  const otpauthUrl = authenticator.keyuri(email, ISSUER, secret);
  return qrcode.toDataURL(otpauthUrl);
}

export function verifyMfaToken(token: string, secret: string): boolean {
  // Allows a small window of clock drift (default step is 30s, window 1 = ±30s).
  return authenticator.verify({ token, secret });
}
