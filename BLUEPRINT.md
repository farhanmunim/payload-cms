# CMS Blueprint — content structure

A plain-language description of this CMS's structure, for rebuilding the same
setup in other systems (Pages CMS, Keystatic, Sveltia, etc.) so they can be
compared like-for-like. The CMS is headless: it only stores and serves content;
a separate frontend (Astro) builds the public site from it.

## Collections (content types)

### Pages — one-off pages like About or Contact
| Field | Type | Notes |
| --- | --- | --- |
| Title | text | required |
| Slug | text | unique; auto-generated from the title if left empty |
| Author | link to one User | defaults to whoever creates the page |
| Cover image | link to one Media item | optional |
| Description | plain multi-line text | used as the page's meta description |
| Content | rich text (WYSIWYG) | headings, bold, lists, links, quotes, inline images |

Has drafts (see Behaviours).

### Posts — blog posts
Everything Pages has (title, slug, author, cover image, content), plus:

| Field | Type | Notes |
| --- | --- | --- |
| Excerpt | plain multi-line text | short summary for listings (instead of Description) |
| Publish date | date + time | auto-set the first time the post is published; editable |
| Featured | checkbox | highlight on homepage/top of listings; default off |
| Categories | links to many Categories | the post's section(s) |
| Tags | links to many Tags | cross-cutting labels |

Has drafts.

### Projects — portfolio items
Title, slug, author, featured, tags, cover image, summary (plain text), rich
text content, plus:

| Field | Type | Notes |
| --- | --- | --- |
| URL | text | link to the live project |
| Attachment | link to one Media item | optional downloadable file (e.g. case study PDF) |

Has drafts.

### Services — service offerings
Title, slug, author, featured, tags, cover image, summary (plain text), rich
text content. No URL or attachment. Has drafts.

### Resources — links and downloads
Same shape as Projects: title, slug, author, featured, tags, cover image,
description (plain text), rich text content, external URL, attachment. A
resource can be an external link, a downloadable file, or both. Has drafts.

### Categories — hierarchical post sections
| Field | Type | Notes |
| --- | --- | --- |
| Name | text | required, unique |
| Slug | text | unique; auto-generated from the name |
| Parent | link to one Category | optional — enables nesting (Guides → Tutorials) |

No drafts. Used by Posts only.

### Tags — flat shared labels
Name (required, unique) and slug (auto-generated). No drafts, no hierarchy.
Used by Posts, Projects, Services, and Resources. In editing UI, tags are
picked from the existing list or created inline.

### Media — one shared library for all uploads
All images and files (attachments, PDFs) live in one library, reusable
everywhere. One extra field: **Alt text** — required for images, optional for
documents. Originals are stored untouched (no automatic resizing or
re-encoding); image optimization is the frontend's job.

### Users — accounts and author profiles
| Field | Type | Notes |
| --- | --- | --- |
| Email + password | account credentials | |
| Role | choice: Admin / Editor | see Roles below |
| First name / Last name | text | the public author byline |
| Avatar | link to one Media item | profile picture shown on the site |
| About the author | rich text | author bio |
| Social links | repeatable list | platform, URL, optional handle — per user |

## Globals (single settings screens, not lists)

### Site Settings (admins only)
- Site name (required), tagline, default meta description
- Logo, favicon, default social-share image (all from Media)
- Footer copyright text
- Social links (repeatable: platform, URL, handle) — the site's own, separate
  from per-user ones
- Analytics dashboard link (a read-only Umami share URL, embedded at
  `/analytics` for logged-in users)
- Deploy hook URL (see Behaviours)
- Script injection: two raw-HTML fields injected into every page's head and
  footer (for analytics/tracking snippets)

### Permalinks (admins only)
One URL prefix per routable collection, editable in the UI. Defaults:
pages at the site root, posts under `/blog`, projects `/projects`, services
`/services`, resources `/resources`, categories `/category`, tags `/tags`.
Empty prefix = served from the site root.

## Behaviours to replicate

- **Drafts**: Pages, Posts, Projects, Services, Resources have draft/publish
  with version history. Drafts are invisible to the public API; only
  authenticated requests (admin, or the frontend build using an API key) see
  them.
- **Auto-slugs**: slugs generate from the title/name when left empty
  (lowercased, hyphenated); always editable.
- **Auto publish date**: set to "now" the first time a post is published.
- **Author defaults** to the logged-in user on every content type.
- **Deploy hook**: when a URL is set in Site Settings, the CMS sends a POST to
  it whenever the public site could change — publishing, editing or
  unpublishing published content, deletions, settings changes. Draft saves
  never trigger it.
- **Import/export**: every content collection can be exported to CSV or JSON
  (all or a filtered subset, with field selection) and imported from a file.

## Roles and safety rules

- **Admin**: everything — manage users, settings, all content.
- **Editor**: manage content and their own profile only; can't see other
  accounts, change settings, or change roles.
- The first account ever created is automatically an admin.
- The last remaining admin can't be demoted or deleted.
- Login locks for 10 minutes after 5 failed attempts.
- Password resets go out by email (Resend).
- Author data exposed through the API is limited to the public profile (name,
  avatar, bio, social links) — never email or account details.

## Sidebar organisation

- **Content**: Pages, Posts, Projects, Services, Resources
- **Organisation**: Categories, Tags, Media
- **Settings**: Users, Site Settings, Permalinks

## Extra pages served by the CMS app itself

- `/` (and `/docs`) — a plain-language editor guide
- `/analytics` — embeds the Umami dashboard for logged-in users
- `/admin` — the CMS itself; `/api/...` — the content API
