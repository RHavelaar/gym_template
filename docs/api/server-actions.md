# Server Actions catalog

Internal mutations invoked from the Next.js UI via the `"use server"` protocol. These are **not**
HTTP REST endpoints — they require a Clerk session and Next.js action headers. Do not add them to
Postman; use this catalog for development and audit reference.

Source files: [`src/app/actions/`](../../src/app/actions/)

---

## Response types

| Type               | Shape                                              | Used by          |
| ------------------ | -------------------------------------------------- | ---------------- |
| `ActionResult<T>`  | `{ ok, data? }` or `{ ok: false, error }`          | CMS, AI, media   |
| `SaveActionResult` | `{ ok }` or `{ ok: false, message, fieldErrors? }` | CMS forms        |
| `ProfileFormState` | `{ ok, message, deltas? }`                         | Profile forms    |
| `PrFormState`      | `{ ok, message }`                                  | PR submit        |
| `void`             | No return (silent fail on validation)              | Some admin forms |
| Direct types       | e.g. `GymAsset[]`, `AuditLogSearchResult`          | Read actions     |

Definitions: [`src/lib/errors/action-result.ts`](../../src/lib/errors/action-result.ts),
[`src/lib/validation/action-result.ts`](../../src/lib/validation/action-result.ts).

---

## Profile and trainer (`profile.ts`)

| Action                         | Auth             | Input      | Return             | Audit action             |
| ------------------------------ | ---------------- | ---------- | ------------------ | ------------------------ |
| `updateFitnessProfileAction`   | `requireMember`  | `FormData` | `ProfileFormState` | `profile.fitness.update` |
| `updateMeasurementGoalsAction` | `requireMember`  | `FormData` | `ProfileFormState` | `profile.goals.update`   |
| `updateProfilePrivacyAction`   | `requireMember`  | `FormData` | `ProfileFormState` | `profile.privacy.update` |
| `addTrainerNoteAction`         | `requireTrainer` | `FormData` | `ProfileFormState` | `trainer.note.create`    |
| `assignTrainerAction`          | `requireManager` | `FormData` | `ProfileFormState` | `trainer.assign`         |

`updateFitnessProfileAction` also logs `post.progress.create` when the member shares to feed.

---

## CMS and media (`content.ts`)

| Action                              | Auth           | Input                      | Return                     | Audit action                 |
| ----------------------------------- | -------------- | -------------------------- | -------------------------- | ---------------------------- |
| `updateBrandAction`                 | `requireOwner` | `unknown` (brandSchema)    | `ActionResult`             | `cms.brand.update`           |
| `refreshBrandPreviewSectionsAction` | `requireOwner` | none                       | `ActionResult<{sections}>` | — (read)                     |
| `updateBusinessAction`              | `requireOwner` | `unknown` (businessSchema) | `ActionResult`             | `cms.business.update`        |
| `updateMediaAction`                 | `requireOwner` | `unknown` (mediaSchema)    | `SaveActionResult`         | `cms.media.update`           |
| `updateFeaturesAction`              | `requireOwner` | `unknown` (featuresSchema) | `ActionResult`             | —                            |
| `updateSiteMenuAction`              | `requireOwner` | `unknown` (siteMenuSchema) | `ActionResult`             | `cms.nav.update`             |
| `saveHomepageSectionsAction`        | `requireOwner` | `HomepageSection[]`        | `ActionResult`             | `cms.homepage.sections.save` |
| `updateHeroSectionAction`           | `requireOwner` | `unknown` (heroSchema)     | `SaveActionResult`         | `cms.hero.update`            |
| `listGymAssetsAction`               | `requireOwner` | `search?: string`          | `GymAsset[]`               | — (read)                     |
| `uploadGymAssetAction`              | `requireOwner` | `FormData`                 | `ActionResult<{ url }>`    | `storage.asset.upload`       |
| `renameGalleryAssetAction`          | `requireOwner` | `{ currentUrl, fileName }` | `ActionResult<{ url }>`    | `storage.asset.rename`       |

---

## Brand AI (`brand-ai.ts`)

Requires Vercel AI Gateway (`hasAiGateway`). No audit events.

| Action                    | Auth           | Input                     | Return                             | Audit |
| ------------------------- | -------------- | ------------------------- | ---------------------------------- | ----- |
| `reviewBrandCopyAction`   | `requireOwner` | brand review input schema | `ActionResult<BrandReviewResult>`  | —     |
| `generateBrandCopyAction` | `requireOwner` | interview answers schema  | `ActionResult<BrandGeneratedCopy>` | —     |

---

## PR submissions (`pr.ts`)

| Action             | Auth            | Input                    | Return        | Audit action  |
| ------------------ | --------------- | ------------------------ | ------------- | ------------- |
| `submitPrAction`   | `requireMember` | `FormData`               | `PrFormState` | `pr.submit`   |
| `moderatePrAction` | `requireStaff`  | `submissionId`, `status` | `void`        | `pr.moderate` |

---

## Staff admin (`admin.ts`)

| Action                    | Auth           | Input      | Return | Audit action         |
| ------------------------- | -------------- | ---------- | ------ | -------------------- |
| `addEquipmentAction`      | `requireStaff` | `FormData` | `void` | `equipment.add`      |
| `createCompetitionAction` | `requireStaff` | `FormData` | `void` | `competition.create` |

---

## Audit log search (`audit.ts`)

Owner-only read actions for `/admin/settings/audit`.

| Action                       | Auth           | Input                   | Return                 | Audit |
| ---------------------------- | -------------- | ----------------------- | ---------------------- | ----- |
| `searchUserAuditLogsAction`  | `requireOwner` | `AuditLogSearchFilters` | `AuditLogSearchResult` | —     |
| `searchAdminAuditLogsAction` | `requireOwner` | `AuditLogSearchFilters` | `AuditLogSearchResult` | —     |

Filters: `query`, `actorProfileId`, `actionPrefix`, `resourceType`, `from`, `to`, `cursor`, `limit`.

---

## Client error reporting (`errors.ts`)

| Action                      | Auth | Input                             | Return        | Audit |
| --------------------------- | ---- | --------------------------------- | ------------- | ----- |
| `reportClientErrorAction`   | none | `{ code, message, detail?, ... }` | `{ eventId }` | —     |
| `reportBoundaryErrorAction` | none | `{ message, route?, digest? }`    | `{ eventId }` | —     |

Writes to the app error capture pipeline (`src/lib/errors/capture.ts`), not audit tables.

---

## RBAC helpers

Defined in [`src/lib/rbac.ts`](../../src/lib/rbac.ts):

| Helper           | Minimum role       |
| ---------------- | ------------------ |
| `requireMember`  | `user`             |
| `requireTrainer` | `personal_trainer` |
| `requireStaff`   | `employee`         |
| `requireManager` | `manager`          |
| `requireOwner`   | `owner`            |

---

## Related

- [API index](./README.md)
- [Multi-tenancy](./multi-tenancy.md)
- Audit system: [docs/audit-logs.md](../audit-logs.md)
- Agent rule for mutations: `.cursor/rules/audit-logging.mdc`
