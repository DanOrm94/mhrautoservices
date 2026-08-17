# MHR Auto Services

Cloudflare-native garage website and admin invoicing application.

## Stack

- React + Vite frontend
- Framer Motion for interactions
- Cloudflare Pages hosting
- Pages Functions for auth/API/business logic
- Cloudflare D1 for metadata and invoice history
- Cloudflare R2 for job photos and generated PDFs
- `pdf-lib` for Worker-compatible invoice generation
- Resend HTTP API for admin email delivery

## Cloudflare Pages settings

Build command: `npm run build`
Build output directory: `dist`

Connect the GitHub repository `DanOrm94/mhrautoservices` to Cloudflare Pages. Deploy from `main` so pushes trigger automatic builds.

## Required bindings

D1:

- Binding: `DB`
- Database: `mhr-auto-services`

R2:

- Binding: `ASSETS`
- Bucket: `mhr-auto-services-assets`

## Required secrets / variables

Set these in the Cloudflare Pages project environment; do not commit their values:

- `JWT_SECRET`
- `ADMIN_PASSWORD_HASH`
- `RESEND_API_KEY`
- `ADMIN_EMAIL`
- `GARAGE_NAME`
- `INVOICE_PREFIX`
- `PUBLIC_ASSET_BASE_URL` (optional)

`ADMIN_PASSWORD_HASH` uses the format documented in `functions/api/login.ts`: `salt$sha256(salt:password)`.

## D1 migration

Apply `migrations/0001_initial.sql` to the production D1 database and the local Wrangler D1 instance before using the admin area.

## Important launch placeholders

The public contact page currently contains placeholder garage contact details and a map placeholder. Replace these with the real business address, phone, email, opening hours and map embed before launch.

The email sender in the Resend function uses Resend's onboarding sender. Replace that sender with a verified domain address in production.

## Local edge testing

Use Wrangler's local runtime for Pages Functions / D1 / R2 testing. The production deployment path is GitHub -> Cloudflare Pages; no persistent local server is required for delivery.
