import { Request, Response, NextFunction } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

const userPoolId = process.env.COGNITO_USER_POOL_ID;
const clientId = process.env.COGNITO_CLIENT_ID;

if (!userPoolId || !clientId) {
  throw new Error('Missing COGNITO_USER_POOL_ID or COGNITO_CLIENT_ID');
}

const verifier = CognitoJwtVerifier.create({
  userPoolId,
  tokenUse: 'access',
  clientId,
});

export interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing access token' });
    return;
  }

  try {
    const token = authHeader.slice('Bearer '.length);
    const payload = await verifier.verify(token);

    const claims = payload as Record<string, unknown>;

    req.user = {
      sub: payload.sub,
    };

    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired access token' });
  }
}