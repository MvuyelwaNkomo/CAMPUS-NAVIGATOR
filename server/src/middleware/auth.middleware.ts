// server/src/middleware/auth.middleware.ts
// Applied to every protected route — checks JWT and attaches user to request

import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import pool from '../db/pool';

// Extend Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
    return;
  }

  // Check session hasn't been revoked (e.g. after logout)
  const crypto = await import('crypto');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const sessionResult = await pool.query(
    `SELECT id FROM sessions
     WHERE token_hash = $1
       AND expires_at > NOW()
       AND revoked_at IS NULL`,
    [tokenHash]
  );

  if (sessionResult.rowCount === 0) {
    res.status(401).json({ error: 'Session expired or revoked. Please log in again.' });
    return;
  }

  // Check user is still active
  const userResult = await pool.query(
    `SELECT id, is_active FROM users WHERE id = $1`,
    [payload.userId]
  );

  if (userResult.rowCount === 0 || !userResult.rows[0].is_active) {
    res.status(401).json({ error: 'Account is inactive. Please contact support.' });
    return;
  }

  req.user = payload;
  next();
}
