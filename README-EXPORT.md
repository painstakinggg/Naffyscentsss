# Naffy Scents — Source Code Export

This archive is a direct copy of the current Naffy Scents application source as it exists in the
Base44 workspace. Nothing was recreated, regenerated or redesigned. UI, routes, cart, checkout,
admin dashboard, reviews, authentication pages, entity schemas and backend functions are the live
versions.

## What is inside

| Path | Contents |
|---|---|
| src/App.jsx, src/main.jsx | Application entry points and route table |
| src/pages/ | All route pages (Home, Shop, Product Detail, Cart, Checkout, Collections, About, Contact, Info pages, Leave Review, Admin, Login, Register, Forgot/Reset Password, MFA, OAuth Consent) |
| src/components/ | Layout, home sections, product, reviews, admin panels and the full shadcn/ui component set |
| src/lib/ | Auth context, cart context, store context, quick-view context, product hook, image map, currency formatting, admin access, MFA clients, query client |
| src/hooks/ | Responsive/size hooks |
| src/utils/, src/api/ | SDK client and helpers |
| src/index.css | Full design system (tokens, fonts, animations) |
| base44/entities/ | Live entity schemas: Product, Order, Review, Promotion, StoreSettings, User |
| base44/functions/ | Live backend functions: sendOrderNotification, confirmPayment, recolorLogo |
| base44/mcp/config.json | App MCP configuration |
| export-data/ | Product catalog, promotions and store settings (bank fields blanked) — see README-DATA.txt |
| migrations/ | Example D1 migration for Cloudflare |
| Root config | package.json, package-lock.json, vite.config.js, tailwind.config.js, postcss.config.js, jsconfig.json, eslint.config.js, components.json, index.html, .gitignore, .npmrc |
| public/favicon.svg | Site favicon |

**Verified:** 152 source files, copied byte-for-byte from the live workspace. node_modules, .git,
dist and secrets are not included (by design).

## Not included

- node_modules, build output and git history.
- Any API keys, tokens, passwords or service credentials. None exist in the client source.
- Uploaded media binaries. Product/lifestyle images are referenced by URL (Base44 media storage,
  Wix static and one ibb.co link). Download them and re-host on your own storage; see the migration guide.
- Customer personal data: order records and review emails are deliberately omitted.
- The Base44-managed authentication backend (tokens, sessions, email verification, MFA transport).

## Install and run

Install the dependencies listed in package.json with npm.

The app is a Vite + React SPA. It boots by contacting the Base44 backend, so it needs three
environment variables to point at an existing Base44 app (see .env.example):

    VITE_BASE44_APP_ID=your_base44_app_id
    VITE_BASE44_FUNCTIONS_VERSION=your_functions_version
    VITE_BASE44_APP_BASE_URL=https://your-app.base44.app

The app id is the identifier in the Base44 editor URL (app.base44.com/apps/<app_id>/...).

    npm run dev       # local dev server (http://localhost:5173)
    npm run build     # production build into ./dist
    npm run preview   # preview the production build
    npm run lint
    npm run typecheck

> If you keep using Base44's hosted backend, the supported way to run locally is the Base44 CLI
> (the base44 npm package, installed globally, then: base44 login, base44 link, base44 dev).
> A bare npm run dev gives you the UI but no /api backend, so login and entity calls will fail.

## Design system

Fonts: Cormorant Garamond (headings), Inter (body), Tenor Sans (display). The palette lives in
src/index.css as CSS variables (--background, --gold, --cream, --obsidian, …) and is mapped in
tailwind.config.js. Change values there, not in components.

## Routes

/, /shop, /product/:id, /cart, /checkout, /collections, /about, /contact, /account, /faq, /shipping,
/returns, /privacy, /terms, /leave-review, /login, /register, /forgot-password, /reset-password,
/mfa, /oauth/consent, /admin, plus the not-found page.

## Base44-specific code (summary)

- @base44/sdk — auth, entity CRUD, function invocation, file upload, user invites.
- @base44/vite-plugin — env injection, dev proxy, editor/analytics hooks.
- src/lib/app-params.js — reads the three VITE_BASE44_* variables.
- base44/entities/*.jsonc — database schema + row-level security.
- base44/functions/*/entry.ts — Deno backend functions using base44.asServiceRole.integrations.Core
  (email sending, image generation).
- src/lib/images.js — image URLs hosted on Base44/Wix CDN.
- src/lib/admin-access.js — email allow-list for the admin dashboard.

Full replacement plan: MIGRATION-CLOUDFLARE.md in this archive.
