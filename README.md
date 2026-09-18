# Payload CMS — blank template (self-hosted)

A blank [Payload CMS 3](https://payloadcms.com) project running on Next.js, set up for
self-hosted deployment (e.g. [Coolify](https://coolify.io)) via the included `Dockerfile`.

- **Database**: SQLite (via `@payloadcms/db-sqlite` / libSQL), stored on disk at `data/`
- **Media uploads**: stored on disk at `media/`
- **Image processing**: `sharp` (resizing, crop, focal point)
- **Collections**: `users` (auth) and `media` — extend as needed in `src/collections/`

## Local development

```bash
cp .env.example .env   # then set PAYLOAD_SECRET (openssl rand -hex 32)
pnpm install
mkdir -p data
pnpm dev
```

Open `http://localhost:3000` — you'll be redirected to `/admin` to create your first user.

## Environment variables

| Variable       | Purpose                                            | Example                  |
| -------------- | -------------------------------------------------- | ------------------------ |
| `PAYLOAD_SECRET` | Secret used to sign auth tokens (required)       | `openssl rand -hex 32`   |
| `DATABASE_URI` | libSQL URL for the SQLite database                 | `file:./data/payload.db` |

Relative `file:` paths resolve from the server's working directory (`/app` in Docker).

## Production build (what the Dockerfile does)

1. `pnpm install --frozen-lockfile`
2. `pnpm run build` — Next.js standalone output in `.next/standalone`
3. Runs `node server.js` as a non-root user on port `3000`

Database migrations in `src/migrations/` run automatically at startup in production
(registered as `prodMigrations` in `src/payload.config.ts`). After changing collections,
generate a new migration with:

```bash
pnpm payload migrate:create
```

## Deploying on Coolify

1. Create an **Application** from your GitHub repository (GitHub App source).
2. **Build pack**: Dockerfile (auto-detected from the repo root). Port: `3000`.
3. **Environment variables**:
   - `PAYLOAD_SECRET` — generate with `openssl rand -hex 32`
   - `DATABASE_URI` — `file:/app/data/payload.db`
4. **Persistent storage** (volume mounts — without these, data is lost on redeploy):
   - `/app/data` — SQLite database
   - `/app/media` — uploaded files
5. Set your domain and deploy. Visit `/admin` to create the first user.

## Useful scripts

- `pnpm dev` — development server
- `pnpm build` / `pnpm start` — production build / serve
- `pnpm lint` — ESLint
- `pnpm generate:types` — regenerate `src/payload-types.ts` after schema changes
- `pnpm payload migrate:create` — create a migration from schema changes
- `pnpm test` — integration (Vitest) + e2e (Playwright) tests

## Questions

If you have any issues or questions, reach out on [Discord](https://discord.com/invite/payload) or start a [GitHub discussion](https://github.com/payloadcms/payload/discussions).
