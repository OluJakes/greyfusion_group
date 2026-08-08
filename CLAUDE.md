# CLAUDE.md — Operating Rules for GreyFusion

This file is auto-loaded as context by Claude Code / Cowork. Read it before doing any work
in this repo. These rules are binding for every session.

## 🔒 RULE #1 — NEVER TOUCH LIVE ADMIN DATA (highest priority)

The client manages real content through the admin console at `/admin`: the **logo**,
**uploaded files/documents**, **credentials**, **media galleries**, **page content**,
pricing, navigation, and more. All of it is stored in the SQLite database on the Fly
volume at **`/data/greyfusion.db`** — it is the source of truth and it is **off-limits**.

**All uploads and admin edits must remain intact at all times.** You make **code and
style changes only**. You must NOT, under any circumstance and without explicit written
approval:

- run `npm run db:seed` (or `tsx prisma/seed.ts`) against production;
- run `prisma db push --accept-data-loss` against the live volume;
- destroy, detach, or recreate the `greyfusion_data` volume;
- edit, delete, or overwrite records in the live database;
- trigger the entrypoint's re-seed branch (it must only ever seed an EMPTY volume).

Deploying new code is safe: the runtime entrypoint checks the volume and, because it
already contains data, logs "preserving live data" and starts the app **without**
re-seeding. Keep it that way.

## 🔒 RULE #2 — No schema changes without sign-off

If a feature seems to need a new DB field or table, **stop and propose a non-destructive
migration first**. Never apply schema changes to the live volume with `--accept-data-loss`
or via a reseed. Get explicit approval, then migrate additively (new nullable columns /
new tables only), never dropping or rewriting existing data.

## 🔒 RULE #3 — Single-writer database / deploy discipline

SQLite is single-writer. The app runs **exactly one always-on Fly machine** with **one**
volume (`fly.toml`: `auto_stop_machines='off'`, `min_machines_running=1`). Deploy **only**
with `fly deploy --ha=false`. Never scale to multiple machines and never add a second
volume — that splits the database and loses writes.

## Design / code guardrails

- **Theme tokens:** style via CSS variables (`--bg`, `--surface`, `--surface-2`, `--ink`,
  `--muted`, `--line`, `--accent`) with `darkMode: "class"`. Every change must be correct
  in **both light and dark mode**. Don't hardcode hex where a token exists.
- **Imagery:** all content images render through `MediaImage` (native `<img>`, with the
  `relative`-vs-caller position guard and `dim`/`fallbackSrc` props). Do **not** reintroduce
  `next/image` for content imagery, and do **not** remove the position guard (it's what keeps
  card thumbnails from collapsing to zero height).
- **`cn()`** is a plain class-join (no tailwind-merge) — watch for conflicting utilities
  (e.g. `absolute` vs `relative`).
- **Public pages are `force-dynamic`** so admin edits appear live on every device. Keep it.
- **Verify before "done":** `tsc --noEmit` must pass; check both themes; no horizontal scroll.

## Backups (safety net)

Fly takes automatic daily volume snapshots (~5-day retention). Take a manual copy before
anything risky:

```
fly ssh console -a greyfusion-group -C "cp /data/greyfusion.db /data/greyfusion.backup.db"
fly sftp get /data/greyfusion.backup.db ./greyfusion-backup.db
```

## Stack (quick reference)

Next.js 14.2 App Router · React 18 · TypeScript · Prisma 7.8 (Rust-free client +
`@prisma/adapter-better-sqlite3`) · SQLite on Fly volume · Tailwind 3.4 · framer-motion ·
deployed on Fly.io (Depot builder, `iad`, single machine + single volume).
