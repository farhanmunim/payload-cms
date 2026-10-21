#!/usr/bin/env bash
# Storage audit of the Coolify app + Docker host. Read-only unless you pass --fix.
# Run on the VPS host.   Usage: bash vps-audit.sh [--fix]
#  - reports database size, orphaned rows, orphan media files, stale system rows
#  - --fix: deletes orphan media files, clears stale lock/job rows, VACUUMs the
#    database, and removes dangling Docker images/build cache and the helper
#    images (payload-seed, payload-tools). Content is never touched.
set -euo pipefail

APP_UUID="${APP_UUID:-iyaczptufhek2jy3shgdubxx}"
BRANCH="${BRANCH:-main}"
REPO="${REPO:-https://github.com/farhanmunim/payload-cms.git}"
FIX=false; [ "${1:-}" = "--fix" ] && FIX=true

APP_CONTAINER="$(docker ps --format '{{.Names}}' | grep "^${APP_UUID}" | head -n1 || true)"
[ -n "$APP_CONTAINER" ] || { echo "App container for ${APP_UUID} not found (is it running?)"; exit 1; }
PAYLOAD_SECRET="$(docker exec "$APP_CONTAINER" printenv PAYLOAD_SECRET)"
DATABASE_URL="$(docker exec "$APP_CONTAINER" printenv DATABASE_URL)"

echo "== Docker disk usage"; docker system df
echo; echo "== Volumes for this app"
docker system df -v 2>/dev/null | grep -E "^VOLUME NAME|${APP_UUID}" || true

docker build --target seed -t payload-tools "${REPO}#${BRANCH}" >/dev/null
echo; echo "== Application storage"
docker run --rm --user 1001:1001 \
  -e PAYLOAD_SECRET="$PAYLOAD_SECRET" -e DATABASE_URL="$DATABASE_URL" \
  -e AUDIT_FIX="$FIX" \
  -v "${APP_UUID}-payload-data:/app/data" \
  -v "${APP_UUID}-payload-media:/app/media" \
  payload-tools node_modules/.bin/payload run scripts/audit-storage.ts

if [ "$FIX" = true ]; then
  echo; echo "== Docker cleanup (dangling images and build cache only)"
  docker image rm payload-tools payload-seed 2>/dev/null || true
  docker image prune -f
  docker builder prune -f
  docker system df
else
  echo; echo "Read-only run. Re-run with --fix to clean up."
fi
