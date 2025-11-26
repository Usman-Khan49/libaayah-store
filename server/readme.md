# Server — Usersync (Firebase Admin + Clerk)

Minimal backend to verify Clerk sessions and upsert user documents into Firestore via the Firebase Admin SDK.

## Prerequisites

- Node 18+ (or compatible)
- Firebase service account JSON
- Clerk server API key

## Files

- `index.js` — Express server with `/api/usersync` endpoint
- `.env.example` — env template (copy to `.env`)
- `.gitignore` — ignore `.env` and `node_modules`

## Required environment variables

- `FIREBASE_SERVICE_ACCOUNT_JSON` — full service account JSON as a single-line string (or load from secret manager)
- `CLERK_API_KEY` — Clerk server API key
- `CLIENT_ORIGIN` — frontend origin (e.g., `http://localhost:5173`)
- `PORT` — server port (default: `3001`)

Do NOT commit `.env` or the service account JSON to git.

## Quick paste: Application default key (one-liner)

```powershell
$env:FIREBASE_SERVICE_ACCOUNT_PATH = 'C:\path\to\service-account.json'
# or
$env:GOOGLE_APPLICATION_CREDENTIALS = 'C:/Users/Usman/Downloads/ibaayah-e86c6-firebase-adminsdk-fbsvc-4c25acaa63.json'
```

## Setup (PowerShell)

```powershell
cd c:\Users\Usman\shopify-headless-store\libaayah-store\server
npm install
copy .env.example .env
# Edit .env to add values (or set env vars in your shell)
```

If you prefer to set env vars in PowerShell for a single session:

```powershell
$env:FIREBASE_SERVICE_ACCOUNT_JSON = Get-Content 'C:\path\to\service-account.json' -Raw
$env:CLERK_API_KEY = 'clerk_xxx'
$env:CLIENT_ORIGIN = 'http://localhost:5173'
$env:PORT = '3001'
node index.js
```

## Run (dev)

```powershell
npm run dev    # if nodemon is configured
# or
node index.js
```

Server logs will show `Usersync server listening on http://localhost:3001` (or configured PORT).

## Test the endpoint

1. Obtain a Clerk session token on the client (example uses Clerk `getToken`).
2. POST to the endpoint:

PowerShell:

```powershell
$body = @{ sessionToken = 'SESSION_TOKEN_HERE' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/usersync -Body $body -ContentType "application/json"
```

curl:

```bash
curl -X POST http://localhost:3001/api/usersync \
  -H "Content-Type: application/json" \
  -d '{"sessionToken":"SESSION_TOKEN_HERE"}'
```

Expected response: `{"ok":true,"userId":"<clerkUserId>"}` and a Firestore document at `Users/{userId}`.

## Production notes

- Store secrets in a secrets manager (Azure Key Vault, GCP Secret Manager, AWS Secrets Manager) or CI/CD secrets — do not store service account JSON in repo.
- Serve over HTTPS and restrict `CLIENT_ORIGIN` CORS to your frontends.
- Add authentication/ratelimiting and logging/monitoring before deploying.
- Use role-based access and rotate keys periodically.

If you want, I can add a small health-check endpoint, request rate limiting, or change the server to accept Clerk cookies (same-origin) instead of session tokens.
