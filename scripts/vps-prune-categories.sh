#!/usr/bin/env bash
# Retire categories that no live content uses (deletes their old version rows first).
# Run on the VPS host. Dry run by default.   Usage: bash vps-prune-categories.sh [--apply]
#  - run scripts/vps-backup.sh first: removed versions are pre-change history
#  - override the list with PRUNE_SLUGS=technical,guides,modelling,open-source
set -euo pipefail

APP_UUID="${APP_UUID:-iyaczptufhek2jy3shgdubxx}"
BRANCH="${BRANCH:-main}"
REPO="${REPO:-https://github.com/farhanmunim/payload-cms.git}"
APPLY=false; [ "${1:-}" = "--apply" ] && APPLY=true

APP_CONTAINER="$(docker ps --format '{{.Names}}' | grep "^${APP_UUID}" | head -n1 || true)"
[ -n "$APP_CONTAINER" ] || { echo "App container for ${APP_UUID} not found (is it running?)"; exit 1; }
PAYLOAD_SECRET="$(docker exec "$APP_CONTAINER" printenv PAYLOAD_SECRET)"
DATABASE_URL="$(docker exec "$APP_CONTAINER" printenv DATABASE_URL)"

docker build --target seed -t payload-tools "${REPO}#${BRANCH}" >/dev/null

docker run --rm --user 1001:1001 \
  -e PAYLOAD_SECRET="$PAYLOAD_SECRET" -e DATABASE_URL="$DATABASE_URL" \
  -e PRUNE_APPLY="$APPLY" -e PRUNE_SLUGS="${PRUNE_SLUGS:-technical,guides,modelling,open-source}" \
  -v "${APP_UUID}-payload-data:/app/data" \
  -v "${APP_UUID}-payload-media:/app/media" \
  payload-tools node_modules/.bin/payload run scripts/prune-old-categories.ts

if [ "$APPLY" != true ]; then echo; echo "Dry run only. Re-run with --apply to delete."; fi
