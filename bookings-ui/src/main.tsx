import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from 'react-oidc-context';

import './index.css';
import App from './App.tsx';

const cognitoAuthConfig = {
  authority: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_UxVTZvAJj',
  client_id: '44030ivk5s3n5i4c6u1a7du0tv',
  redirect_uri: window.location.origin,
  response_type: 'code',
  scope: 'openid email profile',
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </StrictMode>,
);