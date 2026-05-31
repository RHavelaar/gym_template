# Clerk webhook — `POST /api/webhooks/clerk`

Syncs Clerk user lifecycle events into Supabase `profiles` and `gym_memberships`.

**OpenAPI:** [`openapi/openapi.yaml`](../../../openapi/openapi.yaml) — path `/api/webhooks/clerk`

**Implementation:** [`src/app/api/webhooks/clerk/route.ts`](../../../src/app/api/webhooks/clerk/route.ts)

---

## Overview

| Property     | Value                                              |
| ------------ | -------------------------------------------------- |
| Method       | `POST`                                             |
| Path         | `/api/webhooks/clerk`                              |
| Auth         | Clerk/Svix webhook signature (`verifyWebhook`)     |
| Public route | Yes — exempt from Clerk session in `src/proxy.ts`  |
| Tenant scope | Gym from `NEXT_PUBLIC_GYM_SLUG` → `getGymIdBySlug` |

Clerk sends events when users sign up, update their profile, or are deleted. The handler keeps
Supabase `profiles` in sync and creates a default gym membership on first sign-up.

---

## Environment variables

| Variable                       | Required           | Purpose                             |
| ------------------------------ | ------------------ | ----------------------------------- |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Yes (production)   | Webhook signature (`whsec_...`)     |
| `SUPABASE_SECRET_KEY`          | Yes (when syncing) | Service client for profile upsert   |
| `NEXT_PUBLIC_GYM_SLUG`         | Yes                | Target `gym_id` for new memberships |
| `NEXT_PUBLIC_SUPABASE_URL`     | Yes (when syncing) | Supabase project URL                |

Do not prefix signing secrets with `NEXT_PUBLIC_`.

---

## Events handled

| Event          | Action                                                    |
| -------------- | --------------------------------------------------------- |
| `user.created` | Upsert `profiles`; create `gym_memberships` (role `user`) |
| `user.updated` | Upsert `profiles` (display name, avatar)                  |
| `user.deleted` | Delete profile; audit per gym the user belonged to        |

Other Clerk event types are accepted but ignored (handler returns `{ ok: true }`).

### Display name resolution

1. `first_name` + `last_name` (trimmed)
2. Else `username`
3. Else `"Member"`

---

## Request

Clerk POSTs a JSON event envelope. Headers include Svix signature fields validated by
`verifyWebhook(req)`.

Example `user.created` body (simplified):

```json
{
  "type": "user.created",
  "object": "event",
  "data": {
    "id": "user_2abc123",
    "first_name": "Jane",
    "last_name": "Doe",
    "username": "janedoe",
    "image_url": "https://img.clerk.com/example.png"
  }
}
```

---

## Responses

| Status | Body                                 | When                           |
| ------ | ------------------------------------ | ------------------------------ |
| `200`  | `{ "ok": true }`                     | Event processed                |
| `200`  | `{ "ok": true, "skipped": true }`    | Supabase not configured (demo) |
| `400`  | `{ "error": "Verification failed" }` | Invalid webhook signature      |
| `500`  | `{ "error": "Handler failed" }`      | Database or handler error      |

---

## Side effects and audit

On successful profile upsert ([`upsertProfileFromClerk`](../../../src/lib/profiles.ts)):

- `profiles` row keyed by `clerk_user_id`
- `gym_memberships` upsert with `role: user` (ignore duplicates)
- Admin audit: `system.profile.upsert` via `systemActor()`

On delete ([`deleteProfileFromClerk`](../../../src/lib/profiles.ts)):

- Profile row removed
- Admin audit: `system.profile.delete` per affected gym

Agent rule: `.cursor/rules/audit-logging.mdc`

---

## Clerk Dashboard setup

1. [Clerk Dashboard → Webhooks](https://dashboard.clerk.com/~/webhooks) → **Add endpoint**
2. **Endpoint URL**
   - Production: `https://your-domain.com/api/webhooks/clerk`
   - Local: `https://<your-dev-domain>/api/webhooks/clerk` (see below)
3. **Subscribe to events:** `user.created`, `user.updated`, `user.deleted`
4. Copy **Signing secret** → `CLERK_WEBHOOK_SIGNING_SECRET` in `.env.local`

---

## Local development and testing

Clerk must reach your machine over HTTPS. Use ngrok:

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run tunnel
```

Configure `NGROK_STATIC_DOMAIN` in `.env.local` or use `ngrok.yml`. Point the Clerk webhook URL at:

```text
https://<your-dev-domain>/api/webhooks/clerk
```

**Recommended test:** Clerk Dashboard → webhook endpoint → **Send test event** (`user.created`).

Manual Postman calls without a valid Svix signature will receive `400 Verification failed`.
See [`postman/README.md`](../../../postman/README.md).

**Verify success:** Supabase Table Editor → `profiles` row with matching `clerk_user_id`, or sign
up a new user through `/sign-up`.

---

## Multi-tenancy

New memberships are created only for the gym matching `NEXT_PUBLIC_GYM_SLUG`. See
[multi-tenancy](../multi-tenancy.md).

---

## Related

- [API index](../README.md)
- [Server Actions catalog](../server-actions.md) — member profile edits (not this webhook)
- Root README: [Clerk webhook section](../../../README.md)
