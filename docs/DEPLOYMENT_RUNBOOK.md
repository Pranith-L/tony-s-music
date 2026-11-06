# Production Deployment & Operations Runbook

**Project**: Rev. Tony Prakash Official Telugu Christian Music Web Platform  
**Target Environments**: Vercel (Edge & SPA Hosting) + Supabase Cloud (PostgreSQL, Auth, Storage)  
**Production Domain**: `https://tony-prakash-music.vercel.app`  

---

## 1. Pre-Deployment Checklist

Before deploying updates to production, verify:
- [x] All 4 database migrations applied to Supabase PostgreSQL.
- [x] All 30 Row Level Security (RLS) policies active and tested.
- [x] Frontend production build compiles cleanly (`npm --prefix frontend run build`).
- [x] Backend TypeScript build compiles cleanly (`npm --prefix backend run build`).
- [x] Concurrency and atomic fulfillment tests pass (`node scripts/verify_database_rls_e2e.cjs`).
- [x] Payment verification test suite passes (`node scripts/verify_payment_security.cjs`).
- [x] Playwright browser automation tests pass (`python scripts/run_e2e_playwright_audit.py`).

---

## 2. Environment Variables Configuration

Ensure the following variables are configured in the **Vercel Project Settings** and backend hosting environment:

### Frontend Environment Variables (Vercel)
| Variable | Value | Description |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | `https://mrehomunxqccvcwpkwxd.supabase.co` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_o_zU6hleiM1...` | Supabase public anonymous key |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_o_zU6hleiM1...` | Supabase publishable key |
| `VITE_API_URL` | `/api` | Relative API path (proxied by Vercel edge) |
| `VITE_GOOGLE_CLIENT_ID` | `383689242046-7b5m4j5...` | Google Cloud OAuth Client ID |
| `VITE_CASHFREE_ENV` | `sandbox` (or `production`) | Cashfree SDK environment |

### Backend Environment Variables
| Variable | Example Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port for Express API |
| `DATABASE_URL` | `postgresql://postgres...` | Supabase PostgreSQL Connection Pooler URL (Port 6543) |
| `DIRECT_URL` | `postgresql://postgres...` | Direct Supabase PostgreSQL URL for migrations (Port 5432) |
| `SUPABASE_URL` | `https://mrehomunxqccvcwpkwxd.supabase.co` | Supabase project URL |
| `SUPABASE_KEY` | `sb_publishable_...` (or service role) | Supabase API key |
| `CASHFREE_APP_ID` | `TEST...` | Cashfree App ID |
| `CASHFREE_SECRET_KEY` | `TEST...` | Cashfree Secret Key |
| `CASHFREE_ENV` | `sandbox` (or `production`) | Cashfree Gateway Environment |
| `INSTAMOJO_API_KEY` | `test_...` | Instamojo API Key |
| `INSTAMOJO_AUTH_TOKEN` | `test_...` | Instamojo Auth Token |
| `INSTAMOJO_SALT` | `test_...` | Instamojo Webhook Salt |
| `CLIENT_URL` | `https://tony-prakash-music.vercel.app` | Production frontend URL for CORS |
| `JWT_SECRET` | `...` | Secret key for local JWT signing |

---

## 3. Database Migration Deployment Runbook

To apply new migrations or verify existing migrations against Supabase PostgreSQL:

```bash
# Set Node path to resolve dependencies
$env:NODE_PATH="H:\new project\backend\node_modules;H:\new project\frontend\node_modules"

# Run migrations runner
node "H:\new project\scripts\apply_migrations.cjs"

# Verify all policies and triggers
node "H:\new project\scripts\verify_backend_foundation.cjs"
```

---

## 4. External Dashboard Configurations

### 4.1 Google Cloud Console (OAuth 2.0)
1. Go to **Google Cloud Console** &rarr; **APIs & Services** &rarr; **Credentials**.
2. Select the Web Application OAuth 2.0 Client ID.
3. Under **Authorized JavaScript origins**, ensure the following are added:
   - `https://tony-prakash-music.vercel.app`
   - `https://mrehomunxqccvcwpkwxd.supabase.co`
   - `http://localhost:5173`
4. Under **Authorized redirect URIs**, ensure:
   - `https://mrehomunxqccvcwpkwxd.supabase.co/auth/v1/callback`
   - `https://tony-prakash-music.vercel.app/auth`

### 4.2 Cashfree Merchant Dashboard
1. Go to **Cashfree Merchant Dashboard** &rarr; **Payment Gateway** &rarr; **Webhooks**.
2. Configure notify URL:
   - `https://tony-prakash-music.vercel.app/api/payments/cashfree-webhook`
3. Select API Version: `2023-08-01`.
4. Ensure event `PAYMENT_SUCCESS_WEBHOOK` is checked.

### 4.3 Instamojo Dashboard
1. Go to **Instamojo Dashboard** &rarr; **Settings** &rarr; **API & Webhooks**.
2. Copy your private salt to `INSTAMOJO_SALT`.
3. Set the default webhook endpoint to:
   - `https://tony-prakash-music.vercel.app/api/payments/instamojo-webhook`

---

## 5. Troubleshooting & Operational Diagnostics

| Symptom | Diagnostic Step | Immediate Fix |
| :--- | :--- | :--- |
| **CORS error in browser** | Check `backend/src/index.ts` CORS origin whitelist. | Ensure the client origin (`https://tony-prakash-music.vercel.app`) is in the CORS array. |
| **401 Invalid Token on API** | Inspect token format (ES256 vs HMAC). | Ensure `resolveUserFromToken` is active in `auth.ts` to verify Supabase Auth tokens. |
| **404 on page refresh on Vercel** | Check `vercel.json` rewrite rules. | Ensure `"rewrites": [{ "source": "/((?!api/.*).*)", "destination": "/index.html" }]` is present. |
| **Audio streaming blocked** | Check CSP `media-src` in `vercel.json`. | Ensure `blob:`, `https://*.supabase.co`, and `https://*.googlevideo.com` are whitelisted in `media-src`. |

