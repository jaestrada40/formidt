import 'dotenv/config';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from './db';

/**
 * Creates (or resets the password of) the admin account for Lourdes.
 * Run with: npm run seed:admin
 *
 * Reads ADMIN_EMAIL from .env (defaults to lourdes.paredes@idt.net).
 * Generates a random temporary password and prints it ONCE — it is not stored
 * anywhere in plaintext. MFA enrollment (QR code) happens automatically on her
 * first login, before any session is granted.
 */
async function main() {
  const email = (process.env.ADMIN_EMAIL || 'lourdes.paredes@idt.net').toLowerCase().trim();
  const tempPassword = crypto.randomBytes(12).toString('base64url');
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, mfaEnabled: false, mfaSecret: null, failedLoginAttempts: 0, lockedUntil: null },
    create: { email, passwordHash, role: 'admin' },
  });

  console.log('----------------------------------------------------');
  console.log('Cuenta admin lista:');
  console.log('  Email:      ', admin.email);
  console.log('  Contraseña: ', tempPassword);
  console.log('----------------------------------------------------');
  console.log('Comparte esta contraseña con Lourdes por un canal seguro (no email/chat plano).');
  console.log('En su primer login se le pedirá escanear un código QR para activar MFA (TOTP).');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
