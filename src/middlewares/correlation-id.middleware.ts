import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';

export function correlationIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const correlationId = req.headers['x-correlation-id'] || randomUUID();
  req.id = correlationId as string;
  res.setHeader('X-Correlation-Id', correlationId);
  next();
}
