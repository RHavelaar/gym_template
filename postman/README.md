# Postman collection

HTTP Route Handler requests for **Memberfloor**. Server Actions are **not** included — see
[`docs/api/server-actions.md`](../docs/api/server-actions.md).

| File                                                         | Purpose                          |
| ------------------------------------------------------------ | -------------------------------- |
| [`collection`](./gym-platform.postman_collection.json)       | All HTTP API requests            |
| [`local env`](./environments/local.postman_environment.json) | `baseUrl=http://localhost:3000`  |
| [`ngrok env`](./environments/ngrok.postman_environment.json) | `baseUrl=https://<ngrok-domain>` |

OpenAPI source of truth: [`openapi/openapi.yaml`](../openapi/openapi.yaml)

---

## Import

1. Open Postman → **Import**
2. Select `gym-platform.postman_collection.json` and one or both environment files
3. Activate an environment (Local or ngrok) in the top-right dropdown

Alternatively, import `openapi/openapi.yaml` to generate requests — keep the hand-maintained
collection in sync when adding routes (see `.cursor/rules/api-routes.mdc`).

---

## Environments

### Local

Use when `npm run dev` is running on port 3000.

| Variable  | Default                 |
| --------- | ----------------------- |
| `baseUrl` | `http://localhost:3000` |

### ngrok

Use when testing webhooks that require a public HTTPS URL.

1. Set `NGROK_STATIC_DOMAIN` in `.env.local` or configure `ngrok.yml`
2. Run `npm run tunnel` while dev server is up
3. Update `baseUrl` in the ngrok environment to your dev domain

---

## Testing the Clerk webhook

The collection includes `POST /api/webhooks/clerk` with a sample body. **Unsigned requests return
400** — Clerk/Svix signature verification is required.

Recommended workflow:

1. Start dev server and ngrok tunnel
2. Configure Clerk webhook URL: `https://<domain>/api/webhooks/clerk`
3. Use Clerk Dashboard → **Send test event** (`user.created`)
4. Verify `profiles` row in Supabase or check server logs

Do **not** commit webhook signing secrets to this repo. Store `CLERK_WEBHOOK_SIGNING_SECRET` in
`.env.local` only.

---

## Adding new requests

When you add a Route Handler under `src/app/api/`:

1. Update `openapi/openapi.yaml`
2. Add a folder/request to `gym-platform.postman_collection.json`
3. Document in `docs/api/http/<name>.md`
4. Link from `docs/api/README.md`

Agent checklist: `.cursor/rules/api-routes.mdc`
