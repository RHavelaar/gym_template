# Pull request

## Summary

<!-- What changed and why (1–3 sentences) -->

## Checklist

- [ ] `npm run test` — added or updated tests for logic changes
- [ ] `npm run lint` and `npm run format:check` (or pre-commit hooks ran)
- [ ] `npm run lint:md` if any `*.md` or `*.mdc` files changed
- [ ] Supabase migrations: RLS enabled and policies for new or changed `public` tables
- [ ] Successful database writes emit audit events (`logUserAuditEvent` / `logAdminAuditEvent`)
- [ ] Owner settings that affect the public or member site use live iframe preview (`SettingsEditorShell` + `SettingsLivePreviewFrame`)
- [ ] No secrets committed (`.env.local`, API keys, `ngrok.yml`)

## Test plan

<!-- How you verified the change -->
