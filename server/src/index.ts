import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { ensureApplicationSequence } from './db';
import { globalLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth';
import { applicationsRouter } from './routes/applications';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Trust the first proxy hop (Coolify/Traefik) so req.ip reflects the real client IP —
// required for rate limiting and Turnstile to work correctly behind a reverse proxy.
app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://challenges.cloudflare.com'],
        frameSrc: ["'self'", 'https://challenges.cloudflare.com'],
        connectSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
      },
    },
  })
);

app.use(
  cors({
    origin: process.env.APP_URL || true,
    credentials: true,
  })
);

app.use(express.json({ limit: '256kb' }));
app.use(cookieParser());
app.use(globalLimiter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/applications', applicationsRouter);

// Serve the built frontend (single-container deploy for Coolify).
// Compiled server lives at <project_root>/dist-server/index.js, so __dirname is
// <project_root>/dist-server — the frontend build output is one level up, in
// <project_root>/dist (both are direct siblings under the project root).
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

app.use('/api', notFoundHandler);
app.use(errorHandler);

async function main() {
  await ensureApplicationSequence();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Enrollment portal server listening on port ${PORT}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err);
  process.exit(1);
});
