import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'fallback_secret';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function signToken(userId: string): string {
  return jwt.sign({ id: userId }, SECRET, { expiresIn: EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): { id: string } {
  return jwt.verify(token, SECRET) as { id: string };
}
