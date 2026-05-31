# Gym Platform Template

Headless, config-driven gym engagement platform built with **Next.js 16**,
**Clerk**, **Supabase**, and **Vercel**. Iron Asylum (Longview, TX) is the
default seed brand; rebrand for other gyms via config files.

## Features (MVP)

- Public homepage with config-driven sections (hero, hours, location, membership, gallery)
- Member dashboard, PR submission, leaderboards, social feed with reactions
- Competitions listing and detail pages
- Staff admin: PR moderation, equipment CRUD, competition creation, homepage section builder
- Multi-gym ready: `src/config/gyms/*.ts` + `NEXT_PUBLIC_GYM_SLUG`

## Quick start

```bash
npm install
cp .env.example .env.local
# Fill Clerk + Supabase keys (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Demo mode (no Clerk keys):** Public pages, `/dashboard`, `/admin`, and member
flows work with in-memory demo data.

### Public local URL (ngrok, static domain)

Every ngrok account gets a **free dev domain** that stays the same across restarts
(for example `abc123.ngrok-free.dev`). Claim it under
[Dashboard → Domains](https://dashboard.ngrok.com/domains).

1. Install the [ngrok agent](https://ngrok.com/download) (Homebrew: `brew install ngrok`).
2. Authenticate once (token from [Your authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)):

   ```bash
   ngrok config add-authtoken <token>
   ```

3. Configure the static domain (pick one):

   **Option A — `ngrok.yml` (recommended)**

   ```bash
   cp ngrok.yml.example ngrok.yml
   # Edit ngrok.yml: replace YOUR-DEV-DOMAIN with your dev domain hostname
   ```

   `npm run tunnel` merges this file with your user ngrok config (where
   `ngrok config add-authtoken` stores the token). Do not put the authtoken in
   `ngrok.yml`.

   **Option B — `.env.local`**

   ```bash
   NGROK_STATIC_DOMAIN=your-id.ngrok-free.dev
   ```

4. Run the app and tunnel in two terminals:

   ```bash
   npm run dev
   npm run tunnel
   ```

Your public base URL is `https://<your-dev-domain>/` (same URL every time you start
`npm run tunnel`).

**Clerk with ngrok:** In [Clerk → Paths / Domains](https://dashboard.clerk.com/), add
your ngrok origin (for example `https://your-id.ngrok-free.dev`) so sign-in redirects
work through the tunnel. For webhooks, use
`https://<your-dev-domain>/api/webhooks/clerk` (see below).

## Environment variables

| Variable                               | Description                                           |
| -------------------------------------- | ----------------------------------------------------- |
| `NEXT_PUBLIC_GYM_SLUG`                 | Active gym config (`iron-asylum`)                     |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`    | Clerk publishable key                                 |
| `CLERK_SECRET_KEY`                     | Clerk secret key                                      |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase project URL (required)                       |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key (required)                   |
| `SUPABASE_SECRET_KEY`                  | Supabase secret key (`sb_secret_...`) — webhooks only |
| `CLERK_WEBHOOK_SIGNING_SECRET`         | Clerk webhook signing secret (`whsec_...`)            |
| `NGROK_STATIC_DOMAIN`                  | Static ngrok dev hostname (`npm run tunnel`)          |

### Clerk CLI

The `clerk` command is **not** part of `@clerk/nextjs`. Install the CLI package separately.

**Option A — project scripts (recommended, no global install):**

```bash
npm run clerk:login    # one-time browser login
npm run clerk:link     # link this repo to your Clerk app
npm run clerk:env      # write keys to .env.local
```

**Option B — global install (then `clerk` works everywhere):**

```bash
npm install -g clerk
clerk auth login
clerk link
clerk env pull
```

**Option C — one-off without installing globally:**

```bash
npx clerk auth login
npx clerk env pull
```

If `clerk` still fails, copy keys manually from
[dashboard.clerk.com](https://dashboard.clerk.com/~/api-keys) into `.env.local`.

### Supabase

Add these two variables from **Project Settings → API** in the Supabase dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (legacy projects may use `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

You do **not** need a Supabase secret key for normal signed-in app usage — Clerk JWT +
RLS handles that. Add `SUPABASE_SECRET_KEY` only for the **Clerk webhook** (server-side
profile sync). Legacy `SUPABASE_SERVICE_ROLE_KEY` still works as a fallback.

### Clerk webhook (profile sync into Supabase)

The app exposes [`/api/webhooks/clerk`](src/app/api/webhooks/clerk/route.ts). When a user
signs up or updates their Clerk profile, Clerk POSTs here; the handler upserts a row in
`profiles` and creates a `gym_memberships` row on first sign-up.

#### Create the endpoint in Clerk

- [Clerk Dashboard → Webhooks](https://dashboard.clerk.com/~/webhooks) → **Add endpoint**
- **Endpoint URL**
  - Production: `https://your-domain.com/api/webhooks/clerk`
  - Local dev: `npm run tunnel` (static domain) and use
    `https://<your-dev-domain>/api/webhooks/clerk`
- **Subscribe to events** — only these three (ignore the rest for now):
  - `user.created`
  - `user.updated`
  - `user.deleted`
- Save, then copy the **Signing secret** (`whsec_...`)

#### Add to `.env.local`

```bash
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...
SUPABASE_SECRET_KEY=sb_secret_...   # Supabase Dashboard → Project Settings → API → Secret keys
```

`verifyWebhook` reads `CLERK_WEBHOOK_SIGNING_SECRET` automatically. Do not prefix it with
`NEXT_PUBLIC_`.

#### Test

- In the Clerk webhook endpoint page, send a **test** `user.created` event (after tunnel is up for local).
- Or sign up a new user and check Supabase **Table Editor → profiles**.

The route is already public in [`src/proxy.ts`](src/proxy.ts) (`/api/webhooks(.*)`).

### Clerk + Supabase third-party auth (required when both are configured)

When Clerk and Supabase env vars are both set, server actions send the **Clerk
session token** to Supabase so RLS policies can read `auth.jwt() ->> 'sub'` as
the Clerk user id.

1. In [Clerk Dashboard → Supabase setup](https://dashboard.clerk.com/setup/supabase),
   activate the integration and copy your **Clerk domain**.
2. In [Supabase Dashboard → Authentication → Third-party auth](https://supabase.com/dashboard),
   add **Clerk** and paste that domain.

Do **not** use the deprecated Clerk JWT template (shared Supabase JWT secret).
The native integration verifies Clerk tokens via JWKS — no extra env vars needed.

```bash
supabase link --project-ref <your-ref>
supabase db push
psql $DATABASE_URL -f supabase/seed.sql
```

### Contact form email (Resend)

The public **Contact** page saves messages to `contact_inquiries` and notifies the gym by email.
[Resend](https://resend.com) fits multi-tenant SaaS well: one API key, per-gym `reply-to`, affordable
volume, and a simple Node SDK on Vercel.

Add to `.env.local` (server-only):

```bash
RESEND_API_KEY=re_...
# After verifying your domain in Resend:
RESEND_FROM_EMAIL="Iron Asylum <notifications@yourdomain.com>"
```

Without `RESEND_API_KEY`, submissions still save to the **Contact inbox** at `/admin/inbox` — email is
skipped. Notification goes to **Business settings → General email**, with help email as fallback.

### Vercel

```bash
vercel link
vercel env pull .env.local
vercel deploy
```

Set the same env vars in the Vercel project dashboard.

## Project structure

```text
src/
  app/           # Routes: (public), (member), (admin), auth
  components/    # UI, layout, domain components
  config/        # Per-gym branding, nav, features, homepage sections
  lib/           # Auth, RBAC, Supabase, demo data
  proxy.ts       # Request proxy (auth + Supabase session refresh)
supabase/        # Migrations + seed
```

## Rebrand for another gym

1. Copy `src/config/gyms/iron-asylum.ts` → `src/config/gyms/your-gym.ts`
2. Register in `src/config/index.ts` gym registry
3. Set `NEXT_PUBLIC_GYM_SLUG=your-gym`
4. Run Supabase seed with your gym row (or use admin UI when DB is connected)

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run lint:md` — Markdown lint
- `npm run format` — Prettier (write)
- `npm run format:check` — Prettier (check only)
- `npm test` — unit tests

Pre-commit hooks (Husky + lint-staged) run Prettier, ESLint, and markdownlint on staged files. CI runs
`test`, `lint`, and `format:check` on every PR; markdown lint runs when `*.md` or `*.mdc` files change.

For cleaner `git blame` after bulk formatting commits, see [`.git-blame-ignore-revs`](.git-blame-ignore-revs)
(optional locally: `git config blame.ignoreRevsFile .git-blame-ignore-revs`).

## Image assets

Placeholder images use Unsplash URLs in the seed config. Replace them through **Admin → Settings → Media**
or the brand kit export when you have final gym photography and logos.

## Roadmap

- ~~Clerk webhook → Supabase profile sync~~ (done — see `src/app/api/webhooks/clerk/route.ts`)
- Full Supabase queries replacing demo store
- Leaderboard filters (machine, division, date range)
- Competition registration and live standings
- Achievements automation (placeholder page at `/achievements` today)
