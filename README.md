# Greyfusion Limited — Enterprise Platform

Eight industries. One standard of execution. A production-grade Next.js 14 platform:
corporate gateway + seven divisional portals (Construction, Energy, IT, Smart Home &
Security, Real Estate, Autos, eCommerce) + a unified `/admin` operations console.

**Live domain plan:** `www.greyfusion.com.ng`
Divisions resolve both as paths (`/energy` → `/divisions/energy`) and as subdomains
(`energy.greyfusion.com.ng`, handled by `middleware.ts` rewrites — just point the
subdomain DNS at the same app).

---

## Quick start (local)

```bash
npm install          # also runs `prisma generate`
npx prisma db push   # creates prisma/dev.db (SQLite)
npm run db:seed      # populates every model with realistic data
npm run dev          # http://localhost:3000
```

Admin console: `http://localhost:3000/admin` — password comes from `ADMIN_PASSWORD`
in `.env` (default: `greyfusion-ops-2026`). **Change it and `SESSION_SECRET` before deploying.**

> **Upgrading from V8 → V9:** run `npx prisma db push` (adds `SyncLog`,
> `EssCalculationLead`, `SmartHomeQuote`) then `npx prisma generate`. `postinstall`
> already runs generate, so a fresh `npm install` picks the new models up automatically.

## V15 — multi-source storefront catalogue (Solar Village + Intavalto)

The storefront lists whatever is in the `Product` table, so an un-seeded / un-synced
instance shows an empty grid. V15 fixes that two ways:

**Real snapshot in the seed.** `npm run db:seed` now loads 15 real Solar Village products
(inverters, batteries, panels, solar systems) and 3 Intavalto smart-home products — each with
its real image, price and a description — so the storefront is populated immediately.

**12-hour two-source sync.** `src/lib/cron/catalogSync.ts` runs two adapters:
`intavaltoSync` (WooCommerce Store API — full data incl. short + long descriptions, price,
images, categories) and `solarvillageSync` (a Magento listing scraper in
`magentoParse.ts` — name, price, image, category from standard `product-item` markup).
Products upsert into `Product` + `EntityMedia` under `intavalto-` / `solarvillage-` slug
namespaces (manual products and admin media are never touched), and each run writes a
`SyncLog` per source (see /admin → Sync log). Endpoint: `/api/cron/sync-catalog`
(`/api/cron/sync-intavalto` is kept as an alias), scheduled **every 12 hours**
(`0 */12 * * *`) via `vercel.json` — or on cPanel:

```
0 */12 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" \
  https://www.greyfusion.com.ng/api/cron/sync-catalog > /dev/null
```

In local dev (no cron), trigger a sync once with
`curl http://localhost:3000/api/cron/sync-catalog`.

> **Solar Village coverage:** it's a Magento store with no public product JSON API, so the
> adapter crawls listing pages. The homepage listing syncs out of the box; set
> `SOLARVILLAGE_LISTING_URLS` (comma-separated category URLs) to widen coverage. Full long
> descriptions come through reliably for Intavalto (JSON API); for Solar Village the listing
> provides name/price/image/category (the seed ships hand-written descriptions for its items).

## V13 — analytics, RBAC, direct downloads & Tesla hero

**Tesla flagship hero.** `/autos` now leads with the Tesla flagship ultra-charger asset
(`HERO_COVERS.autos`), behind the same protective gradient + z-index layering as the rest
of the matrix.

**Frictionless compliance downloads.** `/compliance` "Request certified copy" is now
**"Download certified copy"**, and both it and **Download full bid pack** hit
`/api/compliance/download` directly — no email capture, no contact wall. The route streams
an admin-uploaded file when present, otherwise generates a real certified-copy **PDF** on
the fly, and assembles the bid pack as a genuine **`.zip`** (hand-rolled store-method
archive, 100MB-capped) — verified extractable by the standard `unzip` tool. Every download
is logged (document title, timestamp, IP) for analytics.

**Native analytics engine.** A GA-style telemetry pipeline with zero third-party scripts:
`AnalyticsEvent` + `DailyAnalyticsSummary` models, a client `AnalyticsTracker` that beacons
PAGE_VIEWs on every route change, a server-owned session cookie, and `/api/analytics/track`.
The `/admin/analytics` dashboard (guarded by `VIEW_ANALYTICS`) shows traffic over
7/30/90-day windows, most-downloaded documents with counts + timestamps, top pages, peak
hours, bounce rate, and an automated strengths/weaknesses read-out. Aggregation lives in the
pure, unit-tested `src/lib/analytics.ts`.

**Granular RBAC + user management.** The session now carries the signed username, so
`src/lib/rbac.ts` resolves the live `AdminUser` to a role and effective permissions. Roles:
`SUPER_ADMIN`, `COMPLIANCE_OFFICER`, `EDITOR`, `AUDITOR`; permission flags include
`MANAGE_*`, `VIEW_ANALYTICS`, `MANAGE_USERS`. `/admin/users` (guarded by `MANAGE_USERS`)
is a full CRUD console — create/edit with role + per-flag permission checkboxes, activate /
disable, delete — with safety rails that block deleting yourself or orphaning the last active
super admin. Sidebar links appear only for permitted roles. Seeded demo accounts:
`compliance@`, `editor@`, `auditor@greyfusion.com.ng` (passwords `compliance-2026` /
`editor-2026` / `auditor-2026`); the super admin remains `hello@greyfusion.com.ng`.

> **Migration:** `npx prisma db push` adds `AnalyticsEvent`, `DailyAnalyticsSummary` and the
> new `AdminUser` columns (`fullName`, `permissions`, `isActive`, `lastLoginAt`); then
> `npx prisma generate` and `npm run db:seed`. Existing admin sessions are invalidated by the
> new signed-identity token format — sign in again once. SQLite note: `permissions` and the
> analytics `metadata` are stored as JSON strings (the spec's `String[]` / `@db.Text` are
> MySQL/Postgres features).

## V10 — division hero matrix & theme contrast defense

**7-division hero image matrix.** Every division page renders its immersive, context-aware
1920px hero (via `HERO_COVERS` in `src/lib/media.ts`) behind protective gradient overlays
with the copy layered above (`relative z-10`): Construction, Renewable Energy, IT, Smart
Home, Real Estate, Autos and eCommerce all use the exact specified Unsplash assets. Energy,
IT and Autos were switched from ambient video to their spec hero image; Smart Home and IT
now point at the correct asset.

**Site-wide light/dark contrast defense.** The platform themes via CSS-variable tokens
(`--bg`, `--surface`, `--ink`, …) with `darkMode: "class"`, so surfaces already adapt — the
real bug was the header. The fixed header used to render **white nav text in a transparent
state**, which vanished on any page without a dark hero (notably `/admin`). The header now
always sits on a theme-aware translucent surface (`bg-[var(--surface)]/90 backdrop-blur`)
with ink-token text, legible on every page in both modes; the console layout gained top
padding to clear it. `layout.tsx` `<body>` carries explicit adaptive base classes, and admin
inventory tables get a distinct header surface. Dropdowns, mobile sheets, inputs and the
MediaManagerModal all render on defined token surfaces — nothing blends into the background.

## V9 — automation, energy sizing & omnichannel

**Intavalto Retail sync engine.** `src/lib/cron/intavaltoSync.ts` ingests the live
catalogue from [intavaltoretail.com](https://intavaltoretail.com) — a WooCommerce store —
via its public **Store API** (`/wp-json/wc/store/v1/products`, clean JSON, no auth,
paginated). Products upsert into `Product` + the relational `EntityMedia` gallery keyed by
an `intavalto-` slug, so **manual products and admin-added media are never touched**; prices
in kobo are converted to Naira, categories are mapped to storefront departments, and every
run writes a `SyncLog` audit row (visible under /admin → Sync log). Pure mapping lives in
`intavaltoMap.ts` (unit-tested against the real API). The endpoint is
`/api/cron/sync-intavalto` (GET/POST, `CRON_SECRET`-guarded) scheduled hourly (`0 * * * *`)
via `vercel.json`, or on cPanel:

```
0 * * * * curl -s -H "Authorization: Bearer $CRON_SECRET" \
  https://www.greyfusion.com.ng/api/cron/sync-intavalto > /dev/null
```

**Energy hero legibility repair.** `/divisions/energy` hero is rebuilt with explicit
z-index layering (background media `z-0` → dark filter + directional gradients `z-10` →
typography `z-20`) plus a stronger drop-shadow, so copy stays legible over the ambient loop.

**Pro ESS calculator.** `ProEssCalculator.tsx` (maths in `src/lib/ess.ts`) sizes a
LiFePO₄ battery bank, PV array and hybrid inverter from an appliance load profile using the
spec formulas (DoD 0.80, inverter η 0.92, 4.85 PSH, system loss 0.78, 1.25 surge, 0.85 PF).
"Request Formal Engineering Quotation" persists an `EssCalculationLead` and mirrors into the
leads pipeline.

**Smart-home configurator → WhatsApp.** `SmartHomeConfigurator.tsx` (pricing in
`src/lib/smarthome.ts`) collects property type, zones and modules, prices them live, logs a
`SmartHomeQuote`, and deep-links the formatted quote to **wa.me/2348092024484**. Package
pricing updated: Essential (2-bed) ₦6,850,000 · Signature (4-bed duplex) ₦12,500,000 ·
Estate & Commercial engineered to spec.

**Dynamic admin logo.** The admin console sidebar now renders the same `Logo` component as
the public header, reading `SiteBranding`, so a logo uploaded in /admin/branding appears in
the backend too.

> **Adaptation note (SQLite):** the spec's `SmartHomeQuote.selectedModules String[]` and
> `@db.Text` columns are MySQL/Postgres features. On the project's SQLite provider these are
> stored the established way — `selectedModules` as a JSON string, text as plain `String` —
> so nothing breaks. Switch the datasource to MySQL (see below) to use native arrays.

## Stack

- **Next.js 14 App Router**, TypeScript strict, `output: "standalone"`, `images.unoptimized` (shared-hosting-safe)
- **Tailwind CSS + Framer Motion** — no chart libraries, no WebGL; all visuals are CSS/SVG
- **Prisma 7 (Rust-free client)** + `better-sqlite3` driver adapter — *no binary engines to
  download or match to your host's OS*, which removes the classic cPanel/CloudLinux
  `rhel-openssl` engine headache entirely
- **React Hook Form + Zod** on every form, re-validated in every Server Action
- **ISR `revalidate = 60`** at the root layout: admin edits reach the public site within
  60 seconds, no redeploy
- **Admin auth**: HMAC-signed session cookie (12h), password from env. Checked in
  middleware **and** independently in the admin layout and every admin API route
  (defense in depth — assume middleware may be disabled on some hosts)

## Switching to MySQL in production (3 small changes)

1. `prisma/schema.prisma` → `datasource db { provider = "mysql" }`
2. `npm i @prisma/adapter-mariadb`
3. In `src/lib/prisma.ts` (and `prisma/seed.ts` / `prisma.config.ts`), replace the
   better-sqlite3 adapter with:
   ```ts
   import { PrismaMariaDb } from "@prisma/adapter-mariadb";
   const adapter = new PrismaMariaDb({
     host: "...", user: "...", password: "...", database: "greyfusion",
     connectionLimit: 3, // shared hosting: keep this low
   });
   ```
   For URL-style config keep the old guidance:
   `mysql://user:pass@localhost:3306/greyfusion?connection_limit=3&pool_timeout=20`

Then run `npx prisma db push && npm run db:seed` against the new database.

## Constrained-hosting deploy runbook (cPanel / CloudLinux)

1. **Build locally**
   ```bash
   npm run build
   cp -r .next/static .next/standalone/.next/static
   cp -r public .next/standalone/public
   ```
2. **Package as .tar.gz — never .zip** (shared-host antivirus loves false-positiving
   zipped `node_modules`):
   ```bash
   tar -czf greyfusion-deploy.tar.gz -C .next/standalone .
   ```
3. **Upload** the tarball via cPanel File Manager and extract it into your app directory.
4. **cPanel → Setup Node.js App**: application root = that directory, startup file =
   `server.js`, Node 20+.
5. **Environment variables** (set in the cPanel UI, not in files):
   - `DATABASE_URL` (e.g. `file:./prisma/dev.db` for SQLite, or your MySQL URL)
   - `ADMIN_PASSWORD` — strong, unique
   - `SESSION_SECRET` — 64 random hex chars
   - `NEXT_PUBLIC_SITE_URL=https://www.greyfusion.com.ng`
6. If using SQLite in production, upload your seeded `prisma/dev.db` next to the app and
   make sure the app user can write to it.
7. Restart the app. Subdomains: point `energy.`, `autos.`, etc. at the same app —
   `middleware.ts` rewrites them to the right portal.

## Media system

All photography and ambient video resolve through `src/lib/media.ts` (Unsplash CDN
images + muted Mixkit loops). `<MediaImage>` paints a division-tinted gradient first,
shimmers while loading, and keeps the gradient if the CDN ever fails — the layout can
never break on a dead asset. `<AmbientVideo>` is poster-backed for the same reason.
To swap any visual, edit the URL in `media.ts` — nothing else changes.

## Project journeys to verify after deploy

- **Construction:** filter portfolio → open a project → register a vendor → see the lead in `/admin/leads`
- **Energy:** run the Solar ROI estimator → book a maintenance visit
- **IT:** run the readiness checker → open a helpdesk ticket → look it up in the client portal by email
- **Real Estate:** filter shortlets → pick dates on the calendar → booking appears in `/admin` (Bookings)
- **Autos:** filter → open a vehicle → swap colours → book a test drive; run the TCO calculator & trade-in
- **Smart Home:** browse packages → book a walkthrough → lead appears under division `smart-home`
- **Commerce:** add to cart → 3-step checkout → order number → track it at `/divisions/commerce/track`;
  stock decrements live (admin can restock under Products)

## Regional payment matrix

`src/lib/payments.ts` implements three gateways behind one interface; every order stores
its originating `gateway` + `gatewayRef` for reconciliation.

1. **Paystack (primary, West Africa)** — LIVE integration (initialize + verify against
   api.paystack.co). Activate by setting `PAYSTACK_SECRET_KEY`. **Do this first, with a
   sandbox key (`sk_test_…`)**: run Paystack's test cards and USSD flows in Naira before
   anything else — Nigeria/West Africa is the primary market. The buyer is redirected to
   Paystack hosted checkout (card / bank transfer / USSD / mobile money) and returns via
   `/api/payments/verify`, which re-verifies server-side and marks the order PAID.
2. **PayPal (international retail)** — slot implemented; set `PAYPAL_CLIENT_ID` +
   `PAYPAL_SECRET` and complete the two marked calls (create order + capture) to activate.
3. **Payoneer (B2B/corporate)** — invoice flow: order records, accounts desk issues a
   Payoneer USD/EUR invoice (Payoneer has no public hosted-checkout API).

Plus offline methods: direct bank transfer and pay-on-delivery. Checkout groups methods
into "Nigeria & West Africa" and "International" tabs with localized instructions, and
delivery uses Nigerian states (Lagos / FCT / Rivers prioritized) + ECOWAS regions.

## Admin identity & math-CAPTCHA login

`/admin/login` now takes a **username**, **password** and a **math CAPTCHA** (A ± B, both
1–99, add or subtract). The challenge answer is stored in a signed, HTTP-only, 10-minute
cookie and re-verified server-side on submit — a fresh question is issued after any failed
attempt. Passwords are hashed with Node's built-in **scrypt** (salted, timing-safe) — no
external crypto dependency. The seeded super-admin is **hello@greyfusion.com.ng** with the
`ADMIN_PASSWORD` env value; additional admins live in the `AdminUser` table, and the
default account also works via the `ADMIN_PASSWORD` env fallback if the table is empty.

(Adaptation: the spec named argon2/bcrypt; neither ships in this runtime, so scrypt —
which is in Node core and equally strong — is used. Swapping to argon2 later is a
one-function change in `src/lib/auth.ts`.)

## Dynamic branding & navigation engine

`SiteBranding` (site name, tagline, light/dark logo, favicon), `NavigationItem` (header +
footer links with location, order, target, visibility, parent/child) and `SocialMediaLink`
(platform, URL, icon, order) are all admin-editable:

- **Logo** — `src/components/Logo.tsx` renders the custom light/dark logo image when set,
  else falls back to the precise inline SVG wordmark. Header picks per theme state.
- **Favicon** — injected into layout metadata from `SiteBranding.faviconUrl`.
- **Footer socials** — rendered from `SocialMediaLink` (LinkedIn, X, Instagram, WhatsApp,
  Facebook, YouTube icons built in) with a coded fallback.
- **Nav** — header gains any `HEADER` items; footer Company column gains `FOOTER_QUICK`.

Manage all of it under /admin → Branding · Navigation · Social links. Logos and favicon
use the dual-path media input (upload a file or paste a URL).

## Universal multi-gallery & asset architecture (V8)

Vehicles, properties, products and projects each carry a relational image gallery via the
`EntityMedia` table (one table, four nullable FKs, cascade delete). Every detail page
renders `ProductGallery` — a high-res main viewport with click-to-zoom lightbox (arrow-key
navigable) and a hover/click thumbnail strip that fade-swaps the main frame with the active
thumbnail glowing (`border-2` + emerald shadow).

**Per-row gallery manager.** Each row in /admin → Vehicles · Properties · Products ·
Projects now shows a **`Gallery (N)`** button beside Edit/Delete. It opens the universal
`MediaManagerModal` (`src/components/admin/MediaManagerModal.tsx`) — a live visual matrix of
that entity's assets with:

- **Dual input** — a drag-and-drop zone for multiple local files (JPG/PNG/WEBP/AVIF, ≤10MB
  each, stored as base64 data URLs) **and** a paste-a-CDN-URL tab (Unsplash / Cloudinary /
  S3 / any absolute image URL).
- **Main cover selector** — a star badge on each card; "Set main" promotes that image and
  demotes its siblings. The main image is exactly what the public list/search cards read as
  their thumbnail.
- **Reorder & delete** — Move-up/Move-down persist `displayOrder`; the trash button removes
  a single asset (and cleans up its on-disk file if one was written). Deleting a cover
  auto-promotes the next image so an entity never loses its thumbnail.

**Server actions** live in `src/app/admin/gallery/actions.ts`: `addEntityMedia`,
`setMainMedia`, `deleteEntityMedia`, `reorderEntityMedia` (plus `listEntityMedia`). All are
admin-guarded, validate the 10MB per-photo limit server-side, and revalidate the admin
tables and public pages so edits reach the site within the ISR window.

**Card overhaul.** The flat SVG car silhouettes in the vehicle marketplace are replaced by
responsive `next/image` cover frames (`aspect-[16/10]`, `object-cover`, hover-scale). All
four marketplaces (`VehicleMarket`, `PropertyBrowser`, `StoreFront`, `PortfolioGrid`) now
render each entity's admin-managed main cover, resolved in a single batched query per page
(`getMainThumbnails`), and fall back to the coded division art when an entity has no media —
so no card is ever empty. The seed attaches a main + 3 secondary Unsplash photos to **every**
vehicle, property, product and project.

**Adaptation notes.** (1) The "main thumbnail" is derived from `EntityMedia.isMain` rather
than a duplicated `thumbnailUrl` column on each table — one source of truth, nothing to keep
in sync, and existing field names (`priceNGN`, `slug`, …) are preserved so no data or code
breaks. `setMainMedia` therefore updates `isMain`, which is exactly what the cards read.
(2) An optional `caption` field was added to `EntityMedia`; it activates after the standard
`npx prisma db push` + `prisma generate` migration step below.

### Applying the V8 migration

```bash
npx prisma db push      # adds EntityMedia.caption; no data loss
npx prisma generate     # refresh the client
npm run db:seed         # (optional) repopulate galleries for every entity
```

## Compliance & Bid-Pack Vault

`/compliance` is a secure vault table rendering `CorporateCredential` rows with
per-credential **status pills** computed from `expiryDate` (Days Remaining > 30 → green
"Valid"; 1–30 → amber "Expiring · Nd"; ≤ 0 → red "Expired"; none → "Perpetual") and file
sizes formatted in MB. A dedicated **Full Bid Pack** row (category `bidpack`) offers a
one-click download of the complete dossier.

Upload rules (enforced server-side in `admin/actions.ts`): bid-pack files ≤ **100MB**,
standard documents ≤ **10MB**. Uploads are validated on the decoded byte length and the
size is recorded automatically; large files should be hosted externally with the URL
pasted instead. Admin fields cover title, authority, number, expiry date, category and
document source (upload **or** URL).

## Insights engine — 200 posts across 8 verticals

`prisma/insights-engine.ts` deterministically generates exactly 200 publication-ready
posts (25 each across construction, energy, IT, realestate, autos, ecommerce, governance,
macroeconomy), interpolating vertical-specific angles, metrics, authors, cover images and
Nigerian regulatory tags (NERC, NDPR, BPP, FIRS, Customs FX, CAMA 2020, AfCFTA…). A seeded
PRNG makes the set reproducible. The 6 original curated long-reads remain as flagship
articles (206 total). `/insights` filters by vertical with a spring-animated tab bar and
"load more" paging; the ⌘K search index is capped to the 60 most recent posts.

## Compliance & Trust Center

`/compliance` renders the corporate credential vault from the `CorporateCredential`
table (seeded with all 13: CAC, FIRS VAT & TCC, ITF, NSITF, PENCOM, BPP, SCUML, NITDA,
COREN, NEMSA, CPN, audited financials). Manage numbers, validity, verification links and
document files under /admin → Credentials. The homepage TrustLayer badge wall links here.
Upload actual certificate PDFs (or paste URLs) to activate the download buttons —
until then each card offers a "request certified copy" mail action.

## NCS FX benchmark

International display prices and invoice conversions use P_ccy = P_NGN / R_NCS.
`src/lib/fx.ts` attempts the Nigeria Customs Service published rate
(customs.gov.ng/exchange-rate, cached 12h, defensively parsed) and falls back to the
admin-controlled `fx_rates` site-config key, then coded defaults. Checkout's
international tab and the Autos marketplace show live conversions with the statutory
NCS disclaimer. To pin rates manually, just edit `fx_rates` in /admin → Site config.

## Dynamic CMS (admin-editable everything)

Four tables make structure and content database-driven, editable in `/admin` and live on
the public site within the 60s ISR window:

- **Page content** (`DynamicPageContent`) — hero titles/subtitles, ambient video and
  image URLs, and a flexible `bodyJson` per page slug. Home, About and all seven division heroes read from it;
  every consumer falls back to coded defaults if no row exists.
- **Pricing plans** (`PricingPlan`) — division plans in NGN/USD/EUR with billing cycle,
  features, highlight and ordering. Smart Home packages render from here; IT retainers
  and Energy O&M plans are seeded ready to surface.
- **Showcase media** (`ShowcaseAsset`) — per-entity image/video overrides (category +
  entity slug). A hero-cover asset replaces the coded Unsplash art on product and
  property pages.
- **Leadership** (`LeadershipPersonnel`) — the About-page leadership grid: names, roles,
  bios, LinkedIn, ordering, and avatars via dual input (paste a URL **or upload a file**
  — uploads are stored inline as base64, ideal for avatars/logos under 2MB).
- **Credentials** (`CorporateCredential`) — the compliance vault.
- **Site config** (`SiteConfiguration`) — JSON key/value store. Seeded keys: `fx_rates`
  (NGN per USD/EUR, drives the ₦/$/€ toggle on the Autos marketplace), `regional_badges`,
  `footer_credits`.

After pulling this version over an existing database, apply the schema:
`npx prisma db push` (or `npx prisma migrate dev --name dynamic-core` if you use
migration history). Then `npm run db:seed` for the demo dataset.

Note: the CMS schema is written SQLite/MySQL-portable — JSON is stored in `String`
columns (`@db.Text`/`String[]` are Postgres-only), parsed through one helper layer.

## Content management

Everything editable lives in `/admin`: vehicles, properties (+ booking/blocked-date
management), products & stock, projects, tenders, jobs, insights posts, plus the unified
leads pipeline with CSV export. Public pages refresh within the 60s ISR window.
