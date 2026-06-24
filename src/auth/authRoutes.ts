import express, { type CookieOptions } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { exchangeCodeForToken, getFacebookUser } from './facebookService';

const router = express.Router();

const isProduction = process.env.NODE_ENV === 'production';
const facebookRedirectUri =
  process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:3001/auth/facebook/callback';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
};

const oauthStateCookieName = 'oauth_state';

interface AuthUserResponse {
  id: string;
  name: string;
  email?: string;
  picture?: string;
  csrfToken: string;
}

router.get('/facebook', (_req, res) => {
  const url = new URL('https://www.facebook.com/dialog/oauth');
  const state = crypto.randomBytes(32).toString('hex');

  url.searchParams.set('client_id', process.env.FACEBOOK_APP_ID!);
  url.searchParams.set('redirect_uri', facebookRedirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'public_profile,email');
  url.searchParams.set('state', state);

  res.cookie(oauthStateCookieName, state, {
    ...authCookieOptions,
    maxAge: 10 * 60 * 1000,
  });

  res.redirect(url.toString());
});

router.get('/facebook/callback', async (req, res) => {
  const code = req.query.code as string | undefined;
  const state = req.query.state as string | undefined;
  const expectedState = req.cookies[oauthStateCookieName] as string | undefined;

  if (!code) {
    return res.status(400).send('Missing Facebook code');
  }

  if (!state || !expectedState || state !== expectedState) {
    res.clearCookie(oauthStateCookieName, authCookieOptions);
    return res.status(400).send('Invalid Facebook state');
  }

  try {
    const facebookToken = await exchangeCodeForToken(code);
    const facebookUser = await getFacebookUser(facebookToken);
    const csrfToken = crypto.randomBytes(32).toString('hex');

    const token = jwt.sign(
      {
        id: facebookUser.id,
        name: facebookUser.name,
        email: facebookUser.email,
        picture: facebookUser.picture?.data?.url,
        csrfToken,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' },
    );

    res.clearCookie(oauthStateCookieName, authCookieOptions);

    res.cookie('auth_token', token, {
      ...authCookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(frontendUrl);
  } catch (err) {
    console.error(err);
    res.status(500).send('Facebook login failed');
  }
});

router.get('/me', (req, res) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.json(null);
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!) as AuthUserResponse;
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      csrfToken: user.csrfToken,
    });
  } catch {
    res.json(null);
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie('auth_token', authCookieOptions);
  res.clearCookie(oauthStateCookieName, authCookieOptions);

  res.json({ ok: true });
});

export default router;