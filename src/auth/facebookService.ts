import axios from 'axios';

const facebookRedirectUri =
  process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:3001/auth/facebook/callback';

export async function exchangeCodeForToken(code: string) {
  const res = await axios.get('https://graph.facebook.com/oauth/access_token', {
    params: {
      client_id: process.env.FACEBOOK_APP_ID,
      client_secret: process.env.FACEBOOK_APP_SECRET,
      redirect_uri: facebookRedirectUri,
      code,
    },
  });

  return res.data.access_token as string;
}

export async function getFacebookUser(accessToken: string) {
  const res = await axios.get('https://graph.facebook.com/me', {
    params: {
      fields: 'id,name,picture',
      access_token: accessToken,
    },
  });

  return res.data;
}