# Audit log system

The gym platform records **who did what and when** for meaningful data changes: profile saves,
CMS settings, storage uploads, posts, staff actions, and webhook-driven profile sync. Events are
**append-only**, **gym-scoped**, and split into two streams so owners can review member activity
separately from site and staff changes.

## Goals and scope

| Log                     | Audience (UI) | Typical events                                     |
| ----------------------- | ------------- | -------------------------------------------------- |
| **User audit**          | Gym owner     | Profile, goals, privacy, progress posts, PR submit |
| **Admin / staff audit** | Gym owner     | CMS, media, trainer ops, equipment, webhooks       |

**In scope:** successful `INSERT` / `UPDATE` / `UPSERT` / `DELETE` on Supabase tables, and
storage upload/rename/move/delete on the `gym-assets` bucket.

**Out of scope:** page views, button clicks without a save, failed validation-only submits, and
read-only queries.

**Access:** Owner role only. UI lives under Site Settings at `/admin/settings/audit`. Managers,
employees, and members cannot read audit tables (RLS + `requireOwner()` on search actions).

Agent enforcement for new mutations: `.cursor/rules/audit-logging.mdc`.

---

## Architecture

```text
Server Action / API route / lib helper
        │
        ▼ (after mutation succeeds)
  logUserAuditEvent  or  logAdminAuditEvent   ← src/lib/audit
        │
        ├── hasSupabase → createServiceClient().insert (bypasses RLS)
        └── !hasSupabase → in-memory ring buffer (demo)
        │
        ▼
  gym_user_audit_events  |  gym_admin_audit_events  (Postgres, partitioned)
        │
        ▼ (read path)
  searchUserAuditLogsAction / searchAdminAuditLogsAction
        │
        └── createClerkSupabaseClient() + owner RLS SELECT
```

**Writes** use the Supabase **service role** on the server only. There is no `INSERT` policy for
`authenticated` clients — the browser cannot forge audit rows.

**Reads** use the Clerk-linked Supabase client so `app_private.is_gym_owner(gym_id)` applies.

Audit failures are logged to the server console and **do not** roll back the user’s mutation.

---

## Database schema

Migration: `supabase/migrations/20260530240000_audit_logs.sql`.

### Tables

Both tables share the same shape:

| Column               | Type              | Notes                                             |
| -------------------- | ----------------- | ------------------------------------------------- |
| `id`                 | `uuid`            | Part of composite primary key                     |
| `gym_id`             | `uuid`            | FK → `gyms(id)`, tenant scope                     |
| `created_at`         | `timestamptz`     | Partition key; default `now()`                    |
| `actor_profile_id`   | `uuid` nullable   | Null for system (e.g. Clerk webhook)              |
| `actor_role`         | `membership_role` | Role at time of action                            |
| `actor_display_name` | `text`            | Denormalized for list UI (no join at read scale)  |
| `action`             | `text`            | Stable machine id, e.g. `cms.brand.update`        |
| `resource_type`      | `text`            | e.g. `profiles`, `gym_branding`, `storage.object` |
| `resource_id`        | `text` nullable   | Target row id, path, or slug                      |
| `summary`            | `text`            | Short human-readable line                         |
| `metadata`           | `jsonb`           | Diffs, counts, extra context (size-capped in app) |

Primary key: `(id, created_at)` — required because tables are **range-partitioned** on
`created_at`.

### Partitioning

Tables use `PARTITION BY RANGE (created_at)` with monthly child partitions. The migration seeds
May–July 2026 plus a **default** partition for dates outside defined ranges.

**Operations:** add a new partition before each month begins:

```sql
CREATE TABLE gym_user_audit_events_2026_08 PARTITION OF gym_user_audit_events
  FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');

CREATE TABLE gym_admin_audit_events_2026_08 PARTITION OF gym_admin_audit_events
  FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
```

Repeat for both streams. For retention, detach or drop old partitions (e.g. older than 24 months)
instead of deleting millions of rows in one transaction.

### Indexes

On each parent table (propagate to partitions):

- `(gym_id, created_at DESC, id DESC)` — listing and keyset pagination
- `(gym_id, actor_profile_id, created_at DESC)` — filter by actor
- `(gym_id, action, created_at DESC)` — filter by action prefix

### RLS

```sql
-- SELECT: gym owner only
app_private.is_gym_owner(gym_id)

-- INSERT / UPDATE / DELETE: no policies for authenticated users
```

---

## Application API

### Core module: `src/lib/audit/`

| Export               | Role                                             |
| -------------------- | ------------------------------------------------ |
| `logUserAuditEvent`  | Append to `gym_user_audit_events`                |
| `logAdminAuditEvent` | Append to `gym_admin_audit_events`               |
| `buildChangeSet`     | `{ field, old, new }[]` for `metadata.changes`   |
| `capAuditMetadata`   | Truncate JSON to ~24 KB (used internally)        |
| `actorFromAuth`      | Build actor from auth context fields             |
| `systemActor`        | Webhooks / system jobs (`displayName: "System"`) |

**Resolve display name:** `resolveAuditActor(auth)` in `src/lib/audit/resolve-actor.ts` loads
`profiles.display_name` once at write time.

### Action constants: `src/types/database.ts`

Add new machine ids to `USER_AUDIT_ACTIONS` or `ADMIN_AUDIT_ACTIONS` (pattern:
`domain.verb.noun`).

#### User stream

| Constant                 | Action id                | Instrumented in              |
| ------------------------ | ------------------------ | ---------------------------- |
| `PROFILE_FITNESS_UPDATE` | `profile.fitness.update` | `profile.ts`                 |
| `PROFILE_GOALS_UPDATE`   | `profile.goals.update`   | `profile.ts`                 |
| `PROFILE_PRIVACY_UPDATE` | `profile.privacy.update` | `profile.ts`                 |
| `POST_PROGRESS_CREATE`   | `post.progress.create`   | `profile.ts` (share to feed) |
| `PR_SUBMIT`              | `pr.submit`              | `pr.ts` (demo store today)   |

#### Admin stream

| Constant                     | Action id                    | Instrumented in               |
| ---------------------------- | ---------------------------- | ----------------------------- |
| `CMS_BRAND_UPDATE`           | `cms.brand.update`           | `content.ts`                  |
| `CMS_BUSINESS_UPDATE`        | `cms.business.update`        | `content.ts`                  |
| `CMS_MEDIA_UPDATE`           | `cms.media.update`           | `content.ts`                  |
| `CMS_NAV_UPDATE`             | `cms.nav.update`             | `content.ts`                  |
| `CMS_FEATURES_UPDATE`        | `cms.features.update`        | `content.ts`                  |
| `CMS_HOMEPAGE_SECTIONS_SAVE` | `cms.homepage.sections.save` | `content.ts`                  |
| `CMS_HERO_UPDATE`            | `cms.hero.update`            | `content.ts`                  |
| `STORAGE_ASSET_UPLOAD`       | `storage.asset.upload`       | `content.ts`                  |
| `STORAGE_ASSET_RENAME`       | `storage.asset.rename`       | `content.ts`                  |
| `TRAINER_NOTE_CREATE`        | `trainer.note.create`        | `profile.ts`                  |
| `TRAINER_ASSIGN`             | `trainer.assign`             | `profile.ts`                  |
| `EQUIPMENT_ADD`              | `equipment.add`              | `admin.ts` (demo)             |
| `COMPETITION_CREATE`         | `competition.create`         | `admin.ts` (demo)             |
| `PR_MODERATE`                | `pr.moderate`                | `pr.ts` (demo)                |
| `SYSTEM_PROFILE_UPSERT`      | `system.profile.upsert`      | `profiles.ts` (Clerk webhook) |
| `SYSTEM_PROFILE_DELETE`      | `system.profile.delete`      | Clerk webhook route           |

When a feature moves from demo stores to Supabase, **keep** the audit call after the real DB write.

### How to add logging to a new mutation

1. Complete the Supabase or storage mutation; confirm success.
2. Choose stream: member self-service → **user**; staff/owner/CMS/system → **admin**.
3. Add a constant in `src/types/database.ts` if needed.
4. Resolve actor and call the logger:

```typescript
import { buildChangeSet, logUserAuditEvent } from "@/lib/audit";
import { resolveAuditActor } from "@/lib/audit/resolve-actor";
import { USER_AUDIT_ACTIONS } from "@/types/database";

const actor = await resolveAuditActor(ctx);
await logUserAuditEvent({
  gymId,
  actor,
  action: USER_AUDIT_ACTIONS.PROFILE_PRIVACY_UPDATE,
  resourceType: "profiles",
  resourceId: ctx.profileId,
  summary: `Changed profile visibility to ${visibility}`,
  metadata: {
    changes: buildChangeSet({ visibility: before }, { visibility: after }, ["visibility"]),
  },
});
```

#### Metadata guidelines

- Prefer field-level `changes` over storing full documents.
- For large CMS payloads (homepage sections), log `sectionKeys`, `sectionCount`, `deletedKeys` —
  not full `props` JSON.
- Avoid secrets; do not log tokens or raw passwords (none should be in scope).
- `capAuditMetadata` drops trailing changes or replaces metadata if still over ~24 KB.

#### System / webhook example

```typescript
import { logAdminAuditEvent, systemActor } from "@/lib/audit";
import { ADMIN_AUDIT_ACTIONS } from "@/types/database";

await logAdminAuditEvent({
  gymId,
  actor: systemActor(),
  action: ADMIN_AUDIT_ACTIONS.SYSTEM_PROFILE_DELETE,
  resourceType: "profiles",
  resourceId: clerkUserId,
  summary: "Clerk deleted user profile",
  metadata: { clerkUserId },
});
```

### Demo mode (`!hasSupabase`)

`src/lib/demo-audit-store.ts` keeps up to **500** events per stream in memory. The same
`logUserAuditEvent` / `logAdminAuditEvent` helpers write to demo storage so local development
without Docker/Supabase still shows the audit UI.

---

## Reading audit logs

### Server actions: `src/app/actions/audit.ts`

| Action                       | Table                    | Auth           |
| ---------------------------- | ------------------------ | -------------- |
| `searchUserAuditLogsAction`  | `gym_user_audit_events`  | `requireOwner` |
| `searchAdminAuditLogsAction` | `gym_admin_audit_events` | `requireOwner` |

**Filters** (`AuditLogSearchFilters`):

| Filter           | Behavior                          |
| ---------------- | --------------------------------- |
| `query`          | `ilike` on `summary` and `action` |
| `from` / `to`    | `created_at` range (ISO strings)  |
| `actorProfileId` | Exact match on `actor_profile_id` |
| `actionPrefix`   | `action` starts with prefix       |
| `resourceType`   | Exact match on `resource_type`    |
| `cursor`         | Keyset: `{ createdAt, id }`       |
| `limit`          | Default 50, max 100               |

**Pagination:** keyset only — `ORDER BY created_at DESC, id DESC`. No `OFFSET` (safe for large
tables). Response: `{ rows, nextCursor, hasMore }`.

### UI

| Path                    | Component                                 |
| ----------------------- | ----------------------------------------- |
| `/admin/settings/audit` | `AuditLogsPanel` — tabs for user vs admin |
| Site Settings hub       | Card linking to audit logs                |

`AuditLogViewer` (client): debounced search, date range (default **last 30 days**), table with
When / Who / Action / Summary, expandable metadata, **Load more** using `nextCursor`.

---

## Stream classification reference

Use this when wiring new code:

| Source                           | User stream | Admin stream |
| -------------------------------- | ----------- | ------------ |
| Member profile / goals / privacy | Yes         |              |
| Progress post to feed            | Yes         |              |
| PR submit (member)               | Yes         |              |
| Owner CMS / branding / pages     |             | Yes          |
| Storage upload / rename          |             | Yes          |
| Trainer note / assign trainer    |             | Yes          |
| Staff equipment / competition    |             | Yes          |
| PR moderation (staff)            |             | Yes          |
| Clerk profile upsert / delete    |             | Yes (system) |
| Lazy membership bootstrap        | Skip (low)  |              |

---

## Operations and scale

| Concern           | Approach                                                  |
| ----------------- | --------------------------------------------------------- |
| Growth            | Monthly partitions; roll forward via scheduled SQL        |
| Query performance | Composite indexes + keyset pagination + default 30-day UI |
| Search at scale   | v1: `ilike`; consider `tsvector` GIN if search slows      |
| Retention         | Detach/drop old partitions; optional cold export later    |
| Integrity         | Append-only; no app updates/deletes on audit rows         |

---

## Verification checklist

1. Apply migration: `supabase db reset` or `supabase migration up` (Docker required locally).
2. As owner: save brand settings → **Staff & site activity** shows `cms.brand.update`.
3. As member: update profile → **User activity** shows `profile.fitness.update`.
4. Open `/admin/settings/audit` — search and date filters return results.
5. Non-owner roles cannot access settings layout or audit search actions.

---

## Related files

| Path                                                | Purpose                    |
| --------------------------------------------------- | -------------------------- |
| `supabase/migrations/20260530240000_audit_logs.sql` | Schema, RLS, partitions    |
| `src/lib/audit/`                                    | Write helpers              |
| `src/lib/demo-audit-store.ts`                       | Demo read/write buffer     |
| `src/app/actions/audit.ts`                          | Owner search API           |
| `src/components/admin/settings/audit-*.tsx`         | UI                         |
| `src/types/database.ts`                             | Types and action constants |
| `.cursor/rules/audit-logging.mdc`                   | Agent requirement          |
