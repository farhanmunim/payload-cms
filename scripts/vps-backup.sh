#!/usr/bin/env bash
# Full backup (data, media, config snapshot) of the Coolify app into one .tar.gz.
# Run on the VPS host. Output: ${OUT_DIR:-/root/payload-backups}/payload-backup-<time>.tar.gz
set -euo pipefail

APP_UUID="${APP_UUID:-iyaczptufhek2jy3shgdubxx}"
BRANCH="${BRANCH:-main}"
REPO="${REPO:-https://github.com/farhanmunim/payload-cms.git}"
OUT_DIR="${OUT_DIR:-/root/payload-backups}"

APP_CONTAINER="$(docker ps --format '{{.Names}}' | grep "^${APP_UUID}" | head -n1 || true)"
[ -n "$APP_CONTAINER" ] || { echo "App container for ${APP_UUID} not found (is it running?)"; exit 1; }
PAYLOAD_SECRET="$(docker exec "$APP_CONTAINER" printenv PAYLOAD_SECRET)"
DATABASE_URL="$(docker exec "$APP_CONTAINER" printenv DATABASE_URL)"

mkdir -p "$OUT_DIR" && chown 1001:1001 "$OUT_DIR"
docker build --target seed -t payload-tools "${REPO}#${BRANCH}"

docker run --rm --user 1001:1001 \
  -e PAYLOAD_SECRET="$PAYLOAD_SECRET" \
  -e DATABASE_URL="$DATABASE_URL" \
  -e BACKUP_DIR=/backups \
  -v "${APP_UUID}-payload-data:/app/data" \
  -v "${APP_UUID}-payload-media:/app/media" \
  -v "${OUT_DIR}:/backups" \
  payload-tools node_modules/.bin/payload run scripts/backup-export.ts

echo; ls -lh "$OUT_DIR" | tail -n 5
