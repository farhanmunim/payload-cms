# Payload CMS — self-hosted headless blueprint

A lean, reusable [Payload CMS 3](https://payloadcms.com) setup running on Next.js,
deployed as a single Docker container (e.g. on [Coolify](https://coolify.io)). Headless
only: the frontend is a separate app consuming the REST API.

## Stack

- **Database**: SQLite (via `@payloadcms/db-sqlite` / libSQL), stored on disk at `data/`
- **Media uploads**: stored on disk at `media/`, processed with `sharp`
- **Email**: Resend (password resets etc.); logs to console when no API key is set
- **Deployment**: Next.js standalone output in Docker, migrations auto-run at startup

## Content model

| Collection | Purpose | Notable fields |
| --- | --- | --- |
| Pages | One-off pages (About, Contact) | title, slug, author, cover image, description, content |
| Posts | Blog posts | + publish date (auto-set), featured, categories, tags |
| Projects | Portfolio items | + live URL, attachment, featured, tags |
| Services | Service offerings | + featured, tags |
| Resources | Links and downloads | + external URL, attachment, featured, tags |
| Categories | Hierarchical post sections | name, slug, optional parent |
| Tags | Flat shared taxonomy | name, slug; selected or created inline everywhere |
| Media | All uploads | alt text (required for images only) |
| Users | Accounts & author profiles | role, name, avatar, bio, social links |

The admin sidebar is grouped: **Content** (Pages → Resources), **Organisation**
(Categories, Tags, Media), **Settings** (Users and the globals). All content
collections carry an `author` relationship defaulting to the logged-in
user. Globals (Settings group): **Site Settings** (site name, logo, favicon, share
image, copyright text, social links, head/footer script injection), **Permalinks**
(URL prefix per collection, read by the frontend at build time).

## Features

- **Draft/publish** with version history on all content collections; drafts are hidden
  from the public API (authenticated requests, e.g. via API key, can read them)
- **Roles**: `admin` (manage users and settings) and `editor` (manage content, edit
  only their own profile, cannot change roles); first registered user is admin
- **Auth hardening**: 5 failed logins locks the account for 10 minutes; API keys can
  be issued per user for server-to-server reads (frontend builds)
- **Slugs** auto-generate from titles; publish dates auto-fill on first publish
- **Deploy hook**: set a URL in Site Settings and the CMS POSTs to it whenever
  published content or settings change, so a static frontend can rebuild
- **Import/export** (official plugin) on all content collections: CSV or JSON,
  full or filtered, with per-row import results. Export files are transient
  (stored at `exports/`, not volume-mounted)
- **Media originals are stored untouched** — no automatic resizing or
  re-encoding; image optimization is the frontend's job

For a non-technical guide to using the admin panel, see [EDITORS.md](./EDITORS.md).

## Local development

```bash
cp .env.example .env   # then set PAYLOAD_SECRET (openssl rand -hex 32)
pnpm install
mkdir -p data
pnpm dev
```

Open `http://localhost:3000/admin` to create the first user (becomes admin).

## Environment variables

| Variable             | Purpose                                              | Example                  |
| -------------------- | ---------------------------------------------------- | ------------------------ |
| `PAYLOAD_SECRET`     | Secret used to sign auth tokens (required)           | `openssl rand -hex 32`   |
| `DATABASE_URI`       | libSQL URL for the SQLite database                   | `file:./data/payload.db` |
| `RESEND_API_KEY`     | Enables outgoing email via Resend (optional)         | `re_...`                 |
| `EMAIL_FROM_ADDRESS` | From address on a Resend-verified domain             | `noreply@example.com`    |
| `EMAIL_FROM_NAME`    | Display name for outgoing email                      | `Example.com`            |

Relative `file:` paths resolve from the server's working directory (`/app` in Docker).

## Conventions (when extending this blueprint)

- **Native Payload only** — see `CLAUDE.md`: built-in fields, globals, access control,
  hooks, and official plugins; no custom admin components.
- Field layout: sidebar holds document controls (slug, featured, tags, dates, role);
  the main column holds content in the order title → image → blurb → content → link →
  attachment.
- New collections get a sidebar `admin.group`, the deploy trigger hooks from
  `src/hooks/triggerDeploy.ts`, and — when routable — an entry in
  `src/globals/Permalinks.ts`.
- After any schema change: `pnpm payload migrate:create <name>`, then
  `pnpm generate:types`; the migration ships with the commit and applies itself on
  deploy. If a collection adds admin components (e.g. new field types), also run
  `pnpm generate:importmap`.

## Deploying on Coolify

1. Create an **Application** from your GitHub repository (GitHub App source).
2. **Build pack**: Dockerfile (auto-detected from the repo root). Port: `3000`.
3. **Environment variables**: `PAYLOAD_SECRET`, `DATABASE_URI=file:/app/data/payload.db`,
   plus the Resend variables above.
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
