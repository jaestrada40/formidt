import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AccessTokenPayload {
  sub: string; // admin user id
  email: string;
  role: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AccessTokenPayload;
    }
  }
}

function getAccessSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) throw new Error('JWT_ACCESS_SECRET is not set.');
  return secret;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, getAccessSecret(), { expiresIn: '15m' });
}

/**
 * Requires a valid access-token cookie (httpOnly, set at login after MFA success).
 * This is the gate protecting every /api/admin/* route — the panel Lourdes uses.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.access_token;
  if (!token) {
    res.status(401).json({ error: 'Not authenticated.' });
    return;
  }
  try {
    const payload = jwt.verify(token, getAccessSecret()) as AccessTokenPayload;
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session.' });
  }
}
