#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PORT="${PORT:-3000}"
CONFIG="${ROOT}/ngrok.yml"

# Authtoken from `ngrok config add-authtoken` lives in the user config, not project ngrok.yml.
resolve_global_ngrok_config() {
  local candidate
  for candidate in \
    "${HOME}/Library/Application Support/ngrok/ngrok.yml" \
    "${HOME}/.config/ngrok/ngrok.yml"; do
    if [[ -f "$candidate" ]]; then
      echo "$candidate"
      return 0
    fi
  done
  return 1
}

GLOBAL_NGROK_CONFIG=""
if GLOBAL_NGROK_CONFIG="$(resolve_global_ngrok_config)"; then
  : # authtoken expected in this file
else
  GLOBAL_NGROK_CONFIG=""
fi

if ! command -v ngrok >/dev/null 2>&1; then
  echo "ngrok is not installed. Install: https://ngrok.com/download" >&2
  exit 1
fi

require_local_app() {
  if lsof -nP -iTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
    return 0
  fi
  cat >&2 <<EOF
Nothing is listening on port ${PORT}.

Start the app first (in another terminal):
  npm run dev

Then run \`npm run tunnel\` again.
EOF
  exit 1
}

load_domain_from_env() {
  if [[ ! -f .env.local ]]; then
    return 0
  fi
  local line
  line="$(grep -E '^NGROK_STATIC_DOMAIN=' .env.local | tail -1 || true)"
  if [[ -z "$line" ]]; then
    return 0
  fi
  NGROK_STATIC_DOMAIN="${line#NGROK_STATIC_DOMAIN=}"
  NGROK_STATIC_DOMAIN="${NGROK_STATIC_DOMAIN%\"}"
  NGROK_STATIC_DOMAIN="${NGROK_STATIC_DOMAIN#\"}"
  export NGROK_STATIC_DOMAIN
}

if [[ -f "$CONFIG" ]]; then
  if [[ -z "$GLOBAL_NGROK_CONFIG" ]]; then
    echo "No ngrok authtoken found. Run: ngrok config add-authtoken <token>" >&2
    exit 1
  fi
  require_local_app
  echo "Starting ngrok from ${CONFIG} (endpoint: gym-template → localhost:${PORT})" >&2
  echo "If you see ERR_NGROK_334 (endpoint already online), stop the other tunnel: pkill ngrok" >&2
  exec ngrok start gym-template --config "$GLOBAL_NGROK_CONFIG" --config "$CONFIG"
fi

load_domain_from_env
if [[ -n "${NGROK_STATIC_DOMAIN:-}" ]]; then
  if [[ -z "$GLOBAL_NGROK_CONFIG" ]]; then
    echo "No ngrok authtoken found. Run: ngrok config add-authtoken <token>" >&2
    exit 1
  fi
  require_local_app
  url="${NGROK_STATIC_DOMAIN}"
  if [[ "$url" != https://* && "$url" != http://* ]]; then
    url="https://${url}"
  fi
  echo "Starting ngrok → ${url} → localhost:${PORT}" >&2
  exec ngrok http "$PORT" --url="$url" --config "$GLOBAL_NGROK_CONFIG"
fi

cat >&2 <<'EOF'
No ngrok static domain configured.

1. Claim your free dev domain: https://dashboard.ngrok.com/domains
2. Authenticate once: ngrok config add-authtoken <token>
3. Either:
   - cp ngrok.yml.example ngrok.yml
     Edit ngrok.yml: set url to your dev domain, then npm run tunnel
   - Or add to .env.local:
     NGROK_STATIC_DOMAIN=your-id.ngrok-free.dev
     Then npm run tunnel

Keep `npm run dev` running in another terminal. Clerk webhooks:
  https://<your-domain>/api/webhooks/clerk
EOF
exit 1
