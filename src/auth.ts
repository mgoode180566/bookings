import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface User {
  id: string;
  name: string;
  email?: string;
  picture?: string;
  sub?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const token = req.cookies.auth_token;

  if (!token) {
    res.status(401).json({ error: 'Missing authentication token' });
    return;
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!) as User;
    req.user = { ...user, sub: user.id };
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
