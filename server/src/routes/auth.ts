import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../db';
import { signAccessToken, requireAdmin } from '../middleware/auth';
import { loginLimiter } from '../middleware/rateLimiter';
import { generateMfaSecret, generateMfaQrCode, verifyMfaToken } from '../services/totp';

export const authRouter = Router();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const REFRESH_COOKIE_DAYS = 7;

function cookieOpts(maxAgeMs: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: maxAgeMs,
    path: '/',
  };
}

function getRefreshSecret(): string {
  const s = process.env.JWT_REFRESH_SECRET;
  if (!s) throw new Error('JWT_REFRESH_SECRET is not set.');
  return s;
}

/**
 * Step 1 of login: email + password.
 * On success (and if MFA is already enabled) responds with mfaRequired: true —
 * the client then calls /verify-mfa with the 6-digit code. No session cookie is
 * issued until MFA passes, so a leaked password alone can never grant access.
 */
authRouter.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña son requeridos.' });
      return;
    }

    const admin = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase().trim() } });

    // Constant-shape response to avoid user enumeration.
    const genericError = { error: 'Credenciales inválidas.' };

    if (!admin) {
      res.status(401).json(genericError);
      return;
    }

    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      res.status(423).json({
        error: `Cuenta bloqueada temporalmente por intentos fallidos. Intenta después de ${admin.lockedUntil.toISOString()}.`,
      });
      return;
    }

    const validPassword = await bcrypt.compare(password, admin.passwordHash);

    if (!validPassword) {
      const attempts = admin.failedLoginAttempts + 1;
      const locked = attempts >= MAX_FAILED_ATTEMPTS;
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: {
          failedLoginAttempts: locked ? 0 : attempts,
          lockedUntil: locked ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000) : null,
        },
      });
      res.status(401).json(genericError);
      return;
    }

    // Reset failed-attempt counter on successful password check.
    if (admin.failedLoginAttempts > 0) {
      await prisma.adminUser.update({ where: { id: admin.id }, data: { failedLoginAttempts: 0, lockedUntil: null } });
    }

    if (!admin.mfaEnabled) {
      // First-ever login: force MFA enrollment before any session is granted.
      const secret = generateMfaSecret();
      await prisma.adminUser.update({ where: { id: admin.id }, data: { mfaSecret: secret } });
      const qr = await generateMfaQrCode(admin.email, secret);
      res.json({ mfaSetupRequired: true, qrCodeDataUrl: qr, tempUserId: admin.id });
      return;
    }

    res.json({ mfaRequired: true, tempUserId: admin.id });
  } catch (err) {
    next(err);
  }
});

/** Step 2: verify the 6-digit TOTP code and issue the real session. */
authRouter.post('/verify-mfa', loginLimiter, async (req, res, next) => {
  try {
    const { tempUserId, code } = req.body as { tempUserId?: string; code?: string };
    if (!tempUserId || !code) {
      res.status(400).json({ error: 'Código requerido.' });
      return;
    }

    const admin = await prisma.adminUser.findUnique({ where: { id: tempUserId } });
    if (!admin || !admin.mfaSecret) {
      res.status(401).json({ error: 'Sesión de verificación inválida.' });
      return;
    }

    const valid = verifyMfaToken(code, admin.mfaSecret);
    if (!valid) {
      res.status(401).json({ error: 'Código MFA inválido.' });
      return;
    }

    if (!admin.mfaEnabled) {
      await prisma.adminUser.update({ where: { id: admin.id }, data: { mfaEnabled: true } });
    }

    await issueSession(admin.id, admin.email, admin.role, res);
    res.json({ success: true, email: admin.email });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/refresh', async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) {
      res.status(401).json({ error: 'No hay sesión.' });
      return;
    }

    let payload: { sub: string };
    try {
      payload = jwt.verify(token, getRefreshSecret()) as { sub: string };
    } catch {
      res.status(401).json({ error: 'Sesión expirada.' });
      return;
    }

    const tokenHash = hashToken(token);
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      res.status(401).json({ error: 'Sesión inválida.' });
      return;
    }

    const admin = await prisma.adminUser.findUnique({ where: { id: payload.sub } });
    if (!admin) {
      res.status(401).json({ error: 'Cuenta no encontrada.' });
      return;
    }

    const accessToken = signAccessToken({ sub: admin.id, email: admin.email, role: admin.role });
    res.cookie('access_token', accessToken, cookieOpts(15 * 60 * 1000));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/logout', requireAdmin, async (req, res, next) => {
  try {
    const token = req.cookies?.refresh_token;
    if (token) {
      await prisma.refreshToken.updateMany({ where: { tokenHash: hashToken(token) }, data: { revoked: true } });
    }
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', requireAdmin, (req, res) => {
  res.json({ email: req.admin?.email, role: req.admin?.role });
});

async function issueSession(adminId: string, email: string, role: string, res: import('express').Response) {
  const accessToken = signAccessToken({ sub: adminId, email, role });
  const refreshToken = jwt.sign({ sub: adminId }, getRefreshSecret(), {
    expiresIn: `${REFRESH_COOKIE_DAYS}d`,
  });

  await prisma.refreshToken.create({
    data: {
      adminId,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_COOKIE_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  res.cookie('access_token', accessToken, cookieOpts(15 * 60 * 1000));
  res.cookie('refresh_token', refreshToken, cookieOpts(REFRESH_COOKIE_DAYS * 24 * 60 * 60 * 1000));
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
