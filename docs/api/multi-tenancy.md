# Multi-tenancy

How gym (tenant) scope is resolved across HTTP routes, Server Actions, and data access.

---

## Current model: one gym per deployment

Each deployment is configured for a single gym via environment and config files:

| Source                 | Resolves to                       | Example           |
| ---------------------- | --------------------------------- | ----------------- |
| `NEXT_PUBLIC_GYM_SLUG` | Config slug in `src/config/gyms/` | `iron-asylum`     |
| `getGymConfig()`       | Full gym branding, nav, features  | Iron Asylum seed  |
| `getGymIdBySlug(slug)` | Postgres `gyms.id` UUID           | When Supabase set |

Implementation: [`getGymIdBySlug`](../../src/lib/profiles.ts) queries `gyms` by slug using the
service client (cached per request).

**There is no per-request gym picker in the UI today.** All members, staff, and owners operate
within the gym tied to the deployment's slug.

---

## Where tenant scope is applied

### Clerk webhook (`POST /api/webhooks/clerk`)

On `user.created` / `user.updated`:

1. Upsert `profiles` row keyed by `clerk_user_id`
2. Upsert `gym_memberships` for `gym_id` from `getGymIdBySlug(config.slug)` with role `user`

On `user.deleted`:

1. Delete profile and emit audit events for all gyms the user belonged to

See [Clerk webhook](./http/clerk-webhook.md).

### Server Actions

RBAC helpers (`requireMember`, `requireOwner`, etc.) return `ctx.gymId` from the signed-in user's
`gym_memberships` row. When Supabase is unavailable, actions fall back to `DEMO_GYM_ID`.

Owner CMS actions use `getOwnerGymContext()` which resolves the owner's gym from auth + config.

### Supabase RLS

Row-level policies use `app_private` helpers (e.g. `is_gym_member`, `is_gym_owner`) keyed on
`gym_id`. Clients never choose a tenant in the request body — membership determines access.

---

## Demo mode

When Clerk or Supabase keys are missing (`hasSupabase: false`), the app uses in-memory demo data
scoped to `DEMO_GYM_ID`. Webhook handler returns `{ ok: true, skipped: true }` without writing.

---

## Future: multi-gym external API

If the platform exposes `/api/v1/*` for partners or mobile apps, tenant resolution must be
explicit and verified — **never trust a client-supplied `gym_id` without authentication**.

Recommended patterns (pick one per integration):

| Pattern        | Tenant resolution             | Auth                              |
| -------------- | ----------------------------- | --------------------------------- |
| Subdomain      | `acme.example.com` → gym slug | Clerk session or API key          |
| API key header | Key maps to `gym_id` in DB    | `Authorization: Bearer <gym_key>` |
| Path prefix    | `/api/v1/gyms/{slug}/...`     | Key or JWT with gym claim         |

Requirements for any future external API:

1. Document in `openapi/openapi.yaml` with `gym_id` / slug in path or security scheme description
2. Add Postman requests under a `/api/v1` folder
3. Follow `.cursor/rules/api-routes.mdc` checklist
4. RLS or service-role usage documented per endpoint

---

## Related

- [API index](./README.md)
- [Server Actions catalog](./server-actions.md)
- Config-driven content: `.cursor/rules/config-driven-content.mdc`
