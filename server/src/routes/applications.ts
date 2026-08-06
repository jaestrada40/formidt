import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAdmin } from '../middleware/auth';
import { submitLimiter } from '../middleware/rateLimiter';
import { verifyTurnstileToken } from '../services/turnstile';
import { sendApplicationNotification } from '../services/email';
import { generateUniqueAppId } from '../utils/ids';
import { encryptField, decryptField, maskSsn } from '../utils/crypto';

export const applicationsRouter = Router();

const ownerSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  title: z.string().min(1),
  ownershipPercent: z.string().min(1),
  lengthOfOwnership: z.string().min(1),
  dob: z.string().min(1),
  ssn: z.string().min(4),
  homeAddress: z.string().min(1),
  city: z.string().min(1),
  state: z.string().optional().default(''),
  zipCode: z.string().min(1),
  country: z.string().default('US'),
  homeTel: z.string().optional().default(''),
  cell: z.string().optional().default(''),
});

const submitSchema = z.object({
  // Honeypot: real users never fill this hidden field. Bots that auto-fill every
  // input on the page do — if it's non-empty we silently accept-and-drop.
  website: z.string().max(0).optional().or(z.literal('')),
  turnstileToken: z.string().min(1, 'Verificación anti-bot requerida.'),

  customerDetails: z.object({
    nrsCustomer: z.enum(['yes', 'no']),
    elmerNumber: z.string().optional().default(''),
    nrsPayMid: z.string().optional().default(''),
  }),
  businessInfo: z.object({
    legalName: z.string().min(1),
    dba: z.string().min(1),
    entityType: z.string().min(1),
    dateStarted: z.string().min(1),
    stateOfIncorporation: z.string().min(1),
    federalTaxId: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().default('US'),
    businessTel: z.string().optional().default(''),
    email: z.string().email(),
  }),
  owners: z.array(ownerSchema).min(1),
});

applicationsRouter.post('/', submitLimiter, async (req, res, next) => {
  try {
    const parsed = submitSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Datos inválidos.', details: parsed.error.flatten() });
      return;
    }
    const data = parsed.data;

    // Honeypot tripped -> pretend success, do nothing. Don't tip off the bot.
    if (data.website) {
      res.status(201).json({ appId: 'APP-000000' });
      return;
    }

    const captchaOk = await verifyTurnstileToken(data.turnstileToken, req.ip);
    if (!captchaOk) {
      res.status(400).json({ error: 'Verificación anti-bot fallida. Intenta de nuevo.' });
      return;
    }

    const appId = await generateUniqueAppId();

    const encryptedOwners = data.owners.map((o) => ({ ...o, ssn: encryptField(o.ssn) }));

    const created = await prisma.application.create({
      data: {
        appId,
        nrsCustomer: data.customerDetails.nrsCustomer,
        elmerNumber: data.customerDetails.elmerNumber,
        nrsPayMid: data.customerDetails.nrsPayMid,
        legalName: data.businessInfo.legalName,
        dba: data.businessInfo.dba,
        entityType: data.businessInfo.entityType,
        dateStarted: data.businessInfo.dateStarted,
        stateOfIncorporation: data.businessInfo.stateOfIncorporation,
        federalTaxId: data.businessInfo.federalTaxId,
        address: data.businessInfo.address,
        city: data.businessInfo.city,
        state: data.businessInfo.state,
        zipCode: data.businessInfo.zipCode,
        country: data.businessInfo.country,
        businessTel: data.businessInfo.businessTel,
        email: data.businessInfo.email,
        owners: encryptedOwners,
        submittedIp: req.ip,
      },
    });

    // Email delivery failure should not fail the submission — the data is already
    // safely in the DB. Log and let the admin panel be the source of truth.
    try {
      await sendApplicationNotification({
        appId: created.appId,
        legalName: created.legalName,
        dba: created.dba,
        email: created.email,
        businessTel: created.businessTel,
        entityType: created.entityType,
        city: created.city,
        state: created.state,
        ownerCount: data.owners.length,
      });
    } catch (emailErr) {
      // eslint-disable-next-line no-console
      console.error('[email] Failed to send notification for', created.appId, emailErr);
    }

    res.status(201).json({ appId: created.appId });
  } catch (err) {
    next(err);
  }
});

// ---- Admin-only endpoints below ----

applicationsRouter.get('/', requireAdmin, async (_req, res, next) => {
  try {
    const apps = await prisma.application.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(
      apps.map((a: (typeof apps)[number]) => ({
        ...a,
        owners: (a.owners as any[]).map((o) => ({ ...o, ssn: maskSsn(decryptField(o.ssn)) })),
      }))
    );
  } catch (err) {
    next(err);
  }
});

applicationsRouter.get('/:id', requireAdmin, async (req, res, next) => {
  try {
    const app = await prisma.application.findUnique({ where: { id: req.params.id } });
    if (!app) {
      res.status(404).json({ error: 'No encontrada.' });
      return;
    }
    // Full unmasked SSN only here, in the single-record authenticated view.
    const owners = (app.owners as any[]).map((o) => ({ ...o, ssn: decryptField(o.ssn) }));
    res.json({ ...app, owners });
  } catch (err) {
    next(err);
  }
});

const statusSchema = z.object({ status: z.enum(['UNDER_REVIEW', 'APPROVED', 'REJECTED']) });

applicationsRouter.patch('/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Estado inválido.' });
      return;
    }
    const updated = await prisma.application.update({
      where: { id: req.params.id },
      data: { status: parsed.data.status },
    });
    res.json({ id: updated.id, status: updated.status });
  } catch (err) {
    next(err);
  }
});

applicationsRouter.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    await prisma.application.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});
