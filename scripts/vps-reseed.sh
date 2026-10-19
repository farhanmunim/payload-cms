#!/usr/bin/env bash
# Wipe and re-import all WordPress content on the Coolify VPS.
# Run on the VPS host (Coolify: Servers > localhost > Terminal, or SSH), not in
# the app container. Optional: export WP_USER and WP_APP_PASSWORD first to also
# import drafts/private content (a WordPress Application Password).
set -euo pipefail

APP_UUID="${APP_UUID:-iyaczptufhek2jy3shgdubxx}"
BRANCH="${BRANCH:-claude/kind-edison-ah39oy}"
REPO="${REPO:-https://github.com/farhanmunim/payload-cms.git}"

APP_CONTAINER="$(docker ps --format '{{.Names}}' | grep "^${APP_UUID}" | head -n1 || true)"
[ -n "$APP_CONTAINER" ] || { echo "App container for ${APP_UUID} not found (is it running?)"; exit 1; }
PAYLOAD_SECRET="$(docker exec "$APP_CONTAINER" printenv PAYLOAD_SECRET)"
DATABASE_URL="$(docker exec "$APP_CONTAINER" printenv DATABASE_URL)"

echo "App container : $APP_CONTAINER"
echo "Database      : $DATABASE_URL"
echo "This DELETES all posts, projects, services, resources, experience,"
echo "categories, tags and media, then re-imports them from WordPress."
echo "Users and Site Settings (other than favicon/share image) are kept."
read -r -p "Type RESET to continue: " CONFIRM
[ "$CONFIRM" = "RESET" ] || { echo "Aborted."; exit 1; }

docker build --target seed -t payload-seed "${REPO}#${BRANCH}"

docker run --rm --user 1001:1001 \
  -e PAYLOAD_SECRET="$PAYLOAD_SECRET" \
  -e DATABASE_URL="$DATABASE_URL" \
  -e SEED_RESET=true \
  -e WP_USER -e WP_APP_PASSWORD \
  -v "${APP_UUID}-payload-data:/app/data" \
  -v "${APP_UUID}-payload-media:/app/media" \
  payload-seed
