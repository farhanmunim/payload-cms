#!/usr/bin/env bash
# Restore a backup made by vps-backup.sh into the Coolify app.
# Usage: scripts/vps-restore.sh /root/payload-backups/payload-backup-<time>.tar.gz
# Run on the VPS host. Existing content is DELETED first (users are kept).
set -euo pipefail

FILE="${1:?Usage: vps-restore.sh /path/to/payload-backup-….tar.gz}"
[ -f "$FILE" ] || { echo "No such file: $FILE"; exit 1; }
FILE="$(readlink -f "$FILE")"

APP_UUID="${APP_UUID:-iyaczptufhek2jy3shgdubxx}"
BRANCH="${BRANCH:-main}"
REPO="${REPO:-https://github.com/farhanmunim/payload-cms.git}"

APP_CONTAINER="$(docker ps --format '{{.Names}}' | grep "^${APP_UUID}" | head -n1 || true)"
[ -n "$APP_CONTAINER" ] || { echo "App container for ${APP_UUID} not found (is it running?)"; exit 1; }
PAYLOAD_SECRET="$(docker exec "$APP_CONTAINER" printenv PAYLOAD_SECRET)"
DATABASE_URL="$(docker exec "$APP_CONTAINER" printenv DATABASE_URL)"

echo "Restoring $FILE into $APP_CONTAINER ($DATABASE_URL)"
echo "This DELETES all current content and media, then restores the backup."
read -r -p "Type RESTORE to continue: " CONFIRM
[ "$CONFIRM" = "RESTORE" ] || { echo "Aborted."; exit 1; }

docker build --target seed -t payload-tools "${REPO}#${BRANCH}"

docker run --rm --user 1001:1001 \
  -e PAYLOAD_SECRET="$PAYLOAD_SECRET" \
  -e DATABASE_URL="$DATABASE_URL" \
  -e BACKUP_FILE=/backup/backup.tar.gz \
  -e RESTORE_WIPE=true \
  -v "${APP_UUID}-payload-data:/app/data" \
  -v "${APP_UUID}-payload-media:/app/media" \
  -v "${FILE}:/backup/backup.tar.gz:ro" \
  payload-tools node_modules/.bin/payload run scripts/backup-restore.ts
