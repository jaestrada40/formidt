import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  // eslint-disable-next-line no-console
  console.error(err);
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error.' : String(err);
  res.status(500).json({ error: message });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Not found.' });
}
