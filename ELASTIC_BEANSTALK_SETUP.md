# Elastic Beanstalk Backend Setup

This backend is ready to run on Elastic Beanstalk (Node.js) with the configuration below.

## What was changed

- `Procfile` now uses `web: npm start`.
- `package.json` now has `prestart` to compile TypeScript before boot.
- `.ebextensions/01-node.config` sets:
  - `NODE_ENV=production`
  - `NPM_USE_PRODUCTION=false` (so TypeScript dev dependencies are available for build)
  - `HealthCheckPath=/health`

## Elastic Beanstalk environment variables

Set these in EB environment configuration:

- `FRONTEND_URL` (for CORS and post-login redirect)
- `JWT_SECRET`
- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `FACEBOOK_REDIRECT_URI` (e.g. `https://<your-backend-domain>/auth/facebook/callback`)
- `BUCKET_NAME`
- `AWS_REGION` (optional, defaults to `eu-west-2` in code)

`NODE_ENV` is set by `.ebextensions/01-node.config`.

## S3 requirements

In production, data is read from S3, not local disk.

Upload initial objects to your bucket root:

- `events.json`
- `participants.json`

The app also writes backups under `backups/`.

## EC2 instance profile permissions

Attach an IAM role policy that allows at least:

- `s3:GetObject` on bucket objects
- `s3:PutObject` on bucket objects
- `s3:CopyObject` equivalent via `s3:GetObject` + `s3:PutObject`
- `s3:ListBucket` on the bucket

## Load balancer / HTTPS

- Use HTTPS with an ACM certificate on ALB.
- Redirect HTTP to HTTPS at ALB listener rules.
- Keep EB health check on `/health`.

## Facebook Login configuration

In the Facebook app settings:

- Add valid OAuth redirect URI:
  - `https://<your-backend-domain>/auth/facebook/callback`
- Ensure app domain/allowed domains match your deployed frontend/backend domains.
- Current scope requested by backend is `public_profile`.

## Deploy artifact

Deploy from repo root so these files are included:

- `Procfile`
- `.ebextensions/01-node.config`
- `src/`, `package.json`, `package-lock.json`, `tsconfig.json`

Avoid deploying `node_modules`.
