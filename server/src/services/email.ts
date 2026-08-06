import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      'SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env'
    );
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // true for 465, false for 587/25 (STARTTLS)
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter;
}

interface ApplicationSummary {
  appId: string;
  legalName: string;
  dba: string;
  email: string;
  businessTel?: string | null;
  entityType: string;
  city: string;
  state: string;
  ownerCount: number;
}

export async function sendApplicationNotification(app: ApplicationSummary): Promise<void> {
  const to = process.env.NOTIFY_EMAIL;
  if (!to) throw new Error('NOTIFY_EMAIL is not set.');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color:#004ac6;">Nueva solicitud de comercio recibida</h2>
      <p><strong>ID de aplicación:</strong> ${app.appId}</p>
      <table cellpadding="6" style="border-collapse:collapse; width:100%;">
        <tr><td style="color:#666;">Razón social</td><td>${escapeHtml(app.legalName)}</td></tr>
        <tr><td style="color:#666;">DBA</td><td>${escapeHtml(app.dba)}</td></tr>
        <tr><td style="color:#666;">Tipo de entidad</td><td>${escapeHtml(app.entityType)}</td></tr>
        <tr><td style="color:#666;">Ciudad/Estado</td><td>${escapeHtml(app.city)}, ${escapeHtml(app.state)}</td></tr>
        <tr><td style="color:#666;">Email de contacto</td><td>${escapeHtml(app.email)}</td></tr>
        <tr><td style="color:#666;">Teléfono</td><td>${escapeHtml(app.businessTel || 'N/A')}</td></tr>
        <tr><td style="color:#666;">Propietarios</td><td>${app.ownerCount}</td></tr>
      </table>
      <p style="margin-top:20px;">
        <a href="${process.env.APP_URL || ''}/admin" style="background:#004ac6;color:white;padding:10px 18px;border-radius:6px;text-decoration:none;">
          Ver en el panel de administración
        </a>
      </p>
      <p style="color:#999; font-size:12px; margin-top:24px;">
        Este correo contiene un resumen. Los datos sensibles (SSN) solo son visibles dentro del panel seguro, con sesión autenticada.
      </p>
    </div>
  `;

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `Nueva solicitud de comercio — ${app.appId} (${app.dba})`,
    html,
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
