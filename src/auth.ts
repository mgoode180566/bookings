import { Request, Response, NextFunction } from 'express';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

let verifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

const getVerifier = (): ReturnType<typeof CognitoJwtVerifier.create> => {
  if (verifier) {
    return verifier;
  }

  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const clientId = process.env.COGNITO_CLIENT_ID;

  if (!userPoolId || !clientId) {
    throw new Error('Missing Cognito configuration');
  }

  verifier = CognitoJwtVerifier.create({
    userPoolId,
    tokenUse: 'access',
    clientId,
  });

  return verifier;
};

export interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    username?: string;
    email?: string;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing access token' });
      return;
    }

    let jwtVerifier: ReturnType<typeof CognitoJwtVerifier.create>;
    try {
      jwtVerifier = getVerifier();
    } catch {
      res.status(500).json({ error: 'Auth is not configured on the server' });
      return;
    }

    const token = authHeader.slice('Bearer '.length);
    const payload = await jwtVerifier.verify(token);
    const payloadClaims = payload as Record<string, unknown>;
    const usernameClaim = payloadClaims['cognito:username'];
    const username =
      typeof payload.username === 'string'
        ? payload.username
        : typeof usernameClaim === 'string'
          ? usernameClaim
          : undefined;

    req.user = {
      sub: payload.sub,
      username,
      email: payload.email as string | undefined,
    };

    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired access token' });
  }
}