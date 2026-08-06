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
    secure: Number(SMTP_PORT) === 465,
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

  const adminUrl = `${process.env.APP_URL || ''}/admin`;
  const entityLabel = formatEntityType(app.entityType);
  const now = new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Merchant Application</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4ff;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4ff;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#004ac6 0%,#0062ff 100%);border-radius:16px 16px 0 0;padding:32px 36px;text-align:center;">
              <p style="margin:0 0 6px;color:#a8c4ff;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Enrollment Portal</p>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;line-height:1.2;">Nueva Solicitud de Comercio</h1>
              <p style="margin:10px 0 0;color:#c5d8ff;font-size:13px;">${e(now)}</p>
            </td>
          </tr>

          <!-- App ID badge -->
          <tr>
            <td style="background:#ffffff;padding:0 36px;">
              <div style="margin:0 auto;background:#eef4ff;border:1px solid #c5d8ff;border-radius:8px;padding:12px 20px;text-align:center;margin-top:-1px;">
                <p style="margin:0;font-size:11px;color:#5a7ab5;text-transform:uppercase;letter-spacing:1px;font-weight:600;">ID de Aplicación</p>
                <p style="margin:4px 0 0;font-size:20px;color:#004ac6;font-weight:700;letter-spacing:1px;">${e(app.appId)}</p>
              </div>
            </td>
          </tr>

          <!-- Business info -->
          <tr>
            <td style="background:#ffffff;padding:28px 36px 8px;">
              <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#004ac6;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #eef4ff;padding-bottom:8px;">Información del Negocio</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${row('Razón Social', app.legalName)}
                ${row('DBA', app.dba)}
                ${row('Tipo de Entidad', entityLabel)}
                ${row('Ciudad / Estado', `${app.city}, ${app.state}`)}
                ${row('Email de Contacto', app.email)}
                ${row('Teléfono', app.businessTel || '—')}
                ${row('Propietarios', String(app.ownerCount))}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="background:#ffffff;padding:28px 36px 36px;text-align:center;">
              <a href="${adminUrl}" style="display:inline-block;background:#004ac6;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 32px;border-radius:10px;letter-spacing:0.3px;">
                Ver en el Panel de Administración →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#e8eeff;border-radius:0 0 16px 16px;padding:20px 36px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#7a90bb;line-height:1.6;">
                Este correo es una notificación automática. Los datos sensibles (SSN) solo son visibles<br/>dentro del panel seguro con sesión autenticada.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `🆕 Nueva solicitud — ${app.appId} · ${app.dba}`,
    html,
  });
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:8px 0;font-size:13px;color:#6b7a99;width:45%;vertical-align:top;">${e(label)}</td>
      <td style="padding:8px 0 8px 12px;font-size:13px;color:#121c28;font-weight:500;vertical-align:top;">${e(value)}</td>
    </tr>`;
}

function formatEntityType(type: string): string {
  const map: Record<string, string> = {
    llc: 'LLC (Limited Liability Company)',
    corp: 'Corporation',
    sole: 'Sole Proprietorship',
    partnership: 'Partnership',
    nonprofit: 'Non-Profit Organization',
  };
  return map[type] ?? type;
}

function e(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
