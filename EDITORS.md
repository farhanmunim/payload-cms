# Using the CMS — editor guide

This is the plain-language guide to the content management system (CMS). It covers
everything you need to write and publish content. Nothing here requires technical
knowledge.

The CMS lives at **`/admin`** on the CMS domain (for this site:
`https://content.farhan.app/admin`). It only manages content — the public website is
built separately and reads from it.

## Logging in

Enter your email and password at `/admin`. Forgot your password? Click **Forgot
password?** and you'll get a reset link by email. After 5 wrong attempts your account
locks for 10 minutes — wait it out, or an admin can unlock you.

## Writing a blog post

1. In the left sidebar, click **Posts**, then **Create New**.
2. Give it a **title**. The **slug** (the post's web address, like `/blog/my-post`)
   fills in automatically from the title — you can edit it if you want a shorter one.
3. Write in the **Content** area. The toolbar has headings, bold, lists, links,
   quotes, and images. New paragraph = Enter; the **+** button or `/` adds blocks.
4. Optionally add a **cover image**, a short **excerpt** (shown in post listings),
   and **tags** (pick existing ones or create new ones right in the field).
5. Choose one:
   - **Save Draft** — saved but invisible to the public.
   - **Publish** — live on the site. The publish date is set automatically the first
     time (you can change or backdate it in the sidebar).

To highlight a post on the homepage or top of listings, tick **Featured** in the
sidebar.

## Other content types

They all work like posts, with small differences:

- **Pages** — one-off pages such as About or Contact.
- **Projects** — portfolio items; can carry a live link and a downloadable file.
- **Services** — service offerings.
- **Resources** — links or downloadable files (e.g. templates); fill the external
  URL, attach a file, or both.
- **Tags** — the shared label list; usually managed inline from the tag field, but
  you can rename or delete tags here (renames apply everywhere at once).

## Images and files

All uploads live in **Media** — anything uploaded inside a post also appears there,
and can be reused anywhere. Images ask for **alt text**: a one-line description used
by screen readers and search engines (documents like PDFs don't need it). Deleting a
media item removes it everywhere it's used — the CMS warns you if it's in use.

## Your profile

Click **Users** → your account (or the avatar, top right → account). Fill in your
**first and last name** (shown as the author byline on the site), a **profile
picture**, an **About the author** bio, and your personal **social links**. The
little picture in the admin's top-right corner comes from [gravatar.com](https://gravatar.com)
for your login email — set it there if you want it.

## Site-wide settings (admins only)

Under **Globals** in the sidebar:

- **Global** — site name, tagline, default description, logo, favicon, the default
  social-share image, and the site's own social links.
- **Permalinks** — the URL prefix for each content type (e.g. posts under `/blog`).
  Changing these changes the public addresses of existing content, so edit with care.

## Roles

- **Admins** can do everything: manage users, change settings, and edit all content.
- **Editors** manage content and their own profile. They can't see other accounts,
  change settings, or change roles.

The CMS protects itself from lock-outs: the first account ever created is an admin,
and the last remaining admin can't be deleted or demoted.

## Publishing and the live site

The public website rebuilds from CMS content. Publishing here makes content
*available*; depending on how the site is set up, changes appear live within a few
minutes.
