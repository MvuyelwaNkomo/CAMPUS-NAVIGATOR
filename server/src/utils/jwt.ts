// server/src/utils/jwt.ts
// Signs and verifies JWTs for all user types

import jwt = require('jsonwebtoken');

export interface JwtPayload {
  userId: string;
  student_number: string;
  role: string;
  iat?: number;
  exp?: number;
}

const SECRET  = process.env.JWT_SECRET as string;
const EXPIRES = process.env.JWT_EXPIRES_IN || '24h';

if (!SECRET) {
  console.error('❌ JWT_SECRET is not set in .env');
  process.exit(1);
}

/** Sign a new JWT for an authenticated user */
export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES } as jwt.SignOptions);
}

/** Verify and decode a JWT. Returns null if invalid or expired. */
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
