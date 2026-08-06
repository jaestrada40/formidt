import rateLimit from 'express-rate-limit';

/**
 * Public form submission: the main defense against "miles de envíos" spam/DDoS-by-volume.
 * Limits each IP to 5 submissions per 15 minutes. Combined with Turnstile + honeypot,
 * this makes scripted mass-submission impractical.
 */
export const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes desde esta dirección. Intenta de nuevo más tarde.' },
});

/**
 * Admin login: strict limit to blunt credential-stuffing / brute-force attempts.
 * Paired with per-account lockout (see routes/auth.ts) as defense in depth.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de inicio de sesión. Intenta de nuevo más tarde.' },
});

/** General API-wide ceiling as a backstop against any endpoint being hammered. */
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
