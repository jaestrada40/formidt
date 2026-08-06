/**
 * Verifies a Cloudflare Turnstile token server-side. Turnstile is a free,
 * privacy-friendly CAPTCHA alternative — it stops scripted/bot form floods
 * (the "miles de envíos" / DDoS-via-spam scenario) without annoying real users.
 *
 * Get free keys at https://dash.cloudflare.com/?to=/:account/turnstile
 */
export async function verifyTurnstileToken(token: string, remoteIp?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    // Fail closed in production; allow through in local dev if explicitly unset.
    if (process.env.NODE_ENV === 'production') return false;
    console.warn('[turnstile] TURNSTILE_SECRET_KEY not set — skipping verification (dev only).');
    return true;
  }

  if (!token) return false;

  const body = new URLSearchParams();
  body.set('secret', secret);
  body.set('response', token);
  if (remoteIp) body.set('remoteip', remoteIp);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body,
  });

  if (!res.ok) return false;
  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}
