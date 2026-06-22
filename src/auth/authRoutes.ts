import express from 'express';
import jwt from 'jsonwebtoken';
import { exchangeCodeForToken, getFacebookUser } from './facebookService';

const router = express.Router();

const isProduction = process.env.NODE_ENV === 'production';
const facebookRedirectUri =
  process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:3001/auth/facebook/callback';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

router.get('/facebook', (_req, res) => {
  const url = new URL('https://www.facebook.com/dialog/oauth');

  url.searchParams.set('client_id', process.env.FACEBOOK_APP_ID!);
  url.searchParams.set('redirect_uri', facebookRedirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'public_profile');

  res.redirect(url.toString());
});

router.get('/facebook/callback', async (req, res) => {
  const code = req.query.code as string | undefined;

  if (!code) {
    return res.status(400).send('Missing Facebook code');
  }

  try {
    const facebookToken = await exchangeCodeForToken(code);
    const facebookUser = await getFacebookUser(facebookToken);

    const token = jwt.sign(
      {
        id: facebookUser.id,
        name: facebookUser.name,
        email: facebookUser.email,
        picture: facebookUser.picture?.data?.url,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' },
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
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
    const user = jwt.verify(token, process.env.JWT_SECRET!);
    res.json(user);
  } catch {
    res.json(null);
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });

  res.json({ ok: true });
});

export default router;