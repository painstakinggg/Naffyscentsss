# Migrating Naffy Scents off Base44 → Cloudflare Pages, D1 and R2

This maps every Base44 dependency to a concrete Cloudflare replacement. The frontend is standard
React + Vite, so it runs on Cloudflare Pages with almost no UI changes; the real work is the
backend (auth, data, functions, files).

## 1. Dependency map

| Base44 piece | Used for | Cloudflare replacement |
|---|---|---|
| @base44/sdk base44.auth | Sign-up, login, OTP, Google OAuth, sessions, MFA | Your own auth (section 3) |
| base44.entities.* | CRUD on Product, Order, Review, Promotion, StoreSettings | D1 + Pages Functions REST endpoints |
| base44.functions.invoke | sendOrderNotification, confirmPayment, recolorLogo | Pages Functions (/api/functions/*) |
| Core.SendEmail | Order + payment notification emails | Resend, MailChannels or Postmark API |
| Core.GenerateImage | Logo recolouring | Replicate / OpenAI / Gemini image edit API |
| Core.UploadPrivateFile / CreateFileSignedUrl | File storage and signing | R2 bucket + signed URLs |
| base44.users.inviteUser | Admin invites | Your own invite flow |
| @base44/vite-plugin | Env injection, dev proxy | Remove; use import.meta.env |
| Base44 CDN images | Product and lifestyle images | R2 public bucket or Cloudflare Images |
| User entity | Roles and profile | users table in D1 |

Nothing in the client source contains secrets. The three VITE_BASE44_* values are public
identifiers, not credentials.

## 2. Project setup

    naffy-scents/
      src/                 # unchanged React app
      functions/api/       # Pages Functions (REST endpoints)
      migrations/          # D1 SQL
      wrangler.toml

wrangler.toml:

    name = "naffy-scents"
    pages_build_output_dir = "dist"
    compatibility_date = "2024-11-01"

    [[d1_databases]]
    binding = "DB"
    database_name = "naffy-scents"
    database_id = "<from wrangler d1 create>"

    [[r2_buckets]]
    binding = "MEDIA"
    bucket_name = "naffy-scents-media"

    [vars]
    APP_URL = "https://naffyscents.com"

Remove @base44/sdk and @base44/vite-plugin from package.json and strip the plugin from
vite.config.js. Replace src/api/base44Client.js with a small fetch wrapper:

    const api = (path, options = {}) =>
      fetch("/api" + path, {
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options,
      }).then(async (r) => {
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.statusText);
        return r.status === 204 ? null : r.json();
      });

    export const db = {
      list: (entity, query) => api("/" + entity + "?" + new URLSearchParams(query)),
      get: (entity, id) => api("/" + entity + "/" + id),
      create: (entity, data) => api("/" + entity, { method: "POST", body: JSON.stringify(data) }),
      update: (entity, id, data) => api("/" + entity + "/" + id, { method: "PATCH", body: JSON.stringify(data) }),
      remove: (entity, id) => api("/" + entity + "/" + id, { method: "DELETE" }),
    };

Then replace call sites mechanically: base44.entities.Product.filter(q, opts) becomes
db.list("products", q), and so on. Keep the hook/context boundaries (useProducts, cart, store,
quick view) so components do not change.

## 3. Authentication (the largest piece)

Base44 owns registration, email verification, login, Google OAuth, password reset, MFA and session
tokens. You must provide equivalents:

1. Tables: users, sessions, password_resets, mfa_secrets (see migrations/0001_init.sql).
2. Hashing: PBKDF2-SHA256 via Web Crypto (available in Workers) or Argon2 in a service binding.
3. Sessions: HttpOnly, Secure, SameSite=Lax cookie holding a random token; store only its SHA-256.
4. Flows to port: src/pages/Login.jsx, Register.jsx, ForgotPassword.jsx, ResetPassword.jsx, Mfa.jsx,
   plus src/lib/AuthContext.jsx, authMfa.js, authMfaFlow.js. The UI and step logic are reusable;
   only the calls change.
5. Google OAuth: implement the authorization-code flow in a Pages Function and reuse the same
   session cookie.
6. Roles: role column ("admin" / "user"). Migrate the email allow-list in src/lib/admin-access.js
   into users.role, then delete the client-side check.
7. Authorization: Base44 entity rules are not code. Recreate them as SQL predicates in each
   endpoint: customers may create orders and read only their own; only admins list or update
   orders, products, reviews and settings; public reads for approved reviews and available
   products. Never rely on client-side hiding.

## 4. Database (D1)

The six schemas are in base44/entities/*.jsonc. A ready-to-run migrations/0001_init.sql is
included. Money is stored as whole naira (REAL) to match the app; switch to integer kobo if you
want exact arithmetic.

Seed the catalog from export-data/products.json and settings from export-data/store-settings.json
(bank fields are blank; fill them in). Historical orders and reviews contain customer PII and were
not exported: use the Base44 dashboard Data view, export them yourself, then import with a one-off
script (wrangler d1 execute --file=seed.sql).

## 5. Backend functions

All three live in base44/functions/*/entry.ts as Deno handlers with the same Request → Response
contract, so they port to functions/api/*.ts with little change.

| Function | What it does | Port notes |
|---|---|---|
| sendOrderNotification | Emails the store owner when an order is placed | Replace Core.SendEmail with Resend (POST https://api.resend.com/emails), secret RESEND_API_KEY |
| confirmPayment | Marks a payment confirmed, blocks duplicates, emails staff | Same email swap; keep the idempotency guard |
| recolorLogo | Recolours the brand logo with Core.GenerateImage | Call an image-edit model directly and store the result in R2 |

Move shared logic (order formatting, money formatting, email templates) into functions/_lib/ so
both order functions reuse it.

## 6. Files and images

- R2: create the naffy-scents-media bucket; upload product images, the logo and lifestyle photos.
  Keep the current keys and rewrite src/lib/images.js to your R2 custom domain, or use Cloudflare
  Images with variants.
- Private uploads: a Pages Function that streams request.body into R2, then returns a signed URL
  (env.MEDIA.get(key) or a presigned URL via aws4fetch).

## 7. Runtime and deployment

Add wrangler as a dev dependency, then:

    npx wrangler d1 create naffy-scents
    npx wrangler d1 execute naffy-scents --file=migrations/0001_init.sql
    npm run build
    npx wrangler pages deploy dist

Secrets: npx wrangler pages secret put RESEND_API_KEY (and any image-AI key). Never put them in
VITE_* variables; those are shipped to the browser.

Add public/_redirects containing:  /* /index.html 200  so React Router deep links work.

## 8. Cutover checklist

- [ ] D1 tables + seed catalog + settings
- [ ] Auth endpoints: register, verify email, login, logout, reset, MFA, Google
- [ ] REST endpoints for products, orders, reviews, promotions, settings with server-side rules
- [ ] Port the three functions; send a real test email
- [ ] Move images to R2 and update src/lib/images.js
- [ ] Replace the admin email allow-list with role
- [ ] Remove @base44/sdk, @base44/vite-plugin, src/api/base44Client.js, src/lib/app-params.js
- [ ] Import historical orders/reviews (PII: keep private, never commit)
- [ ] Set _redirects, custom domain, TLS
- [ ] Final QA: cart → checkout → order → payment proof → admin status update → review → approval

## 9. What cannot be migrated automatically

- Base44-hosted user accounts and password hashes (not exportable). Users must set new passwords,
  or you enable Google sign-in and magic links.
- Session tokens and MFA enrolments.
- Base44-managed email deliverability and its sending domain.
- Stored customer orders/reviews unless you export them from the dashboard yourself.
