import React from 'react'
import './docs.css'

export const metadata = {
  title: 'Using the CMS',
  description: 'Plain-language guide to writing and publishing content.',
}

export default function DocsPage() {
  return (
    <div className="docs">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@500;700&family=Source+Sans+3:ital,wght@0,400;0,600;1,400&display=swap"
      />
      <div className="inner">
        <h1>Using the CMS</h1>
        <p className="lede">
          The plain-language guide to writing and publishing content. No technical knowledge
          needed.
        </p>

        <span className="addr">/admin — on this same domain</span>
        <p>
          That address is the content management system (CMS). It only manages content — the
          public website is built separately and reads from it.
        </p>

        <nav className="nav">
          <a href="#login">Logging in</a>
          <a href="#post">Writing a post</a>
          <a href="#types">Content types</a>
          <a href="#media">Images &amp; files</a>
          <a href="#profile">Your profile</a>
          <a href="#settings">Site settings</a>
          <a href="#roles">Roles</a>
        </nav>

        <h2 id="login">Logging in</h2>
        <p>
          Enter your email and password at <code>/admin</code>. Forgot your password? Click{' '}
          <span className="ui">Forgot password?</span> and you&apos;ll get a reset link by email.
        </p>
        <div className="note">
          <strong>Locked out?</strong> After 5 wrong attempts your account locks for 10 minutes.
          Wait it out, or ask an admin to unlock you.
        </div>

        <h2 id="post">Writing a blog post</h2>
        <ol>
          <li>
            In the left sidebar, click <span className="ui">Posts</span>, then{' '}
            <span className="ui">Create New</span>.
          </li>
          <li>
            Give it a <strong>title</strong>. The <strong>slug</strong> — the post&apos;s web
            address, like <code>/blog/my-post</code> — fills in automatically from the title. Edit
            it if you want something shorter.
          </li>
          <li>
            Write in the <strong>Content</strong> area. The toolbar has headings, bold, lists,
            links, quotes, and images. The <span className="ui">+</span> button (or typing{' '}
            <code>/</code>) inserts blocks.
          </li>
          <li>
            Optionally add a <strong>cover image</strong>, a short <strong>excerpt</strong> (shown
            in post listings), and <strong>tags</strong> — pick existing ones or create new ones
            right in the field.
          </li>
          <li>
            Finish with one of two buttons:
            <ul>
              <li>
                <span className="ui">Save Draft</span> — saved, but invisible to the public.
              </li>
              <li>
                <span className="ui">Publish</span> — live on the site. The publish date sets
                itself the first time; you can change or backdate it in the sidebar.
              </li>
            </ul>
          </li>
        </ol>
        <p>
          Want a post highlighted on the homepage or the top of listings? Tick{' '}
          <strong>Featured</strong> in the sidebar.
        </p>

        <h2 id="types">The other content types</h2>
        <p>They all work like posts, with small differences:</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>What it&apos;s for</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Pages</strong>
                </td>
                <td>One-off pages such as About or Contact.</td>
              </tr>
              <tr>
                <td>
                  <strong>Projects</strong>
                </td>
                <td>Portfolio items; can carry a live link and a downloadable file.</td>
              </tr>
              <tr>
                <td>
                  <strong>Services</strong>
                </td>
                <td>Service offerings.</td>
              </tr>
              <tr>
                <td>
                  <strong>Resources</strong>
                </td>
                <td>
                  Links or downloads (e.g. templates) — fill the external URL, attach a file, or
                  both.
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Categories</strong>
                </td>
                <td>
                  A post&apos;s section, e.g. Guides. Can be nested (Guides → Tutorials). A post
                  usually has one; use tags for everything else.
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Tags</strong>
                </td>
                <td>
                  The shared label list. Usually managed from inside a tag field, but here you can
                  rename or delete tags — renames apply everywhere at once.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 id="media">Images and files</h2>
        <p>
          All uploads live in <span className="ui">Media</span>. Anything you upload inside a post
          lands there too, and can be reused anywhere.
        </p>
        <p>
          Images ask for <strong>alt text</strong>: a one-line description used by screen readers
          and search engines. Documents like PDFs don&apos;t need it.
        </p>
        <div className="note">
          <strong>Careful with delete.</strong> Removing a media item removes it everywhere
          it&apos;s used — the CMS warns you if something still references it.
        </div>

        <h2 id="importexport">Import and export</h2>
        <p>
          Every content list (Posts, Pages, Tags…) has an <span className="ui">Export</span>{' '}
          option in its list controls: choose CSV or JSON, pick which fields to include, and
          export everything or just your current filtered selection.{' '}
          <span className="ui">Import</span> brings documents in from a file the same way,
          reporting per-row results. Download exports straight away — they aren&apos;t kept
          long-term.
        </p>

        <h2 id="profile">Your profile</h2>
        <p>
          Click <span className="ui">Users</span> → your account. Fill in your{' '}
          <strong>first and last name</strong> (your author byline on the site), a{' '}
          <strong>profile picture</strong>, an <strong>About the author</strong> bio, and your
          personal <strong>social links</strong>.
        </p>
        <p>
          The small picture in the admin&apos;s top-right corner is separate — it comes from{' '}
          <a href="https://gravatar.com" rel="noopener noreferrer" target="_blank">
            gravatar.com
          </a>{' '}
          for your login email. Set a photo there if you want it.
        </p>

        <h2 id="settings">
          Site-wide settings <em>(admins only)</em>
        </h2>
        <p>
          Under <strong>Settings</strong> in the sidebar:
        </p>
        <ul>
          <li>
            <span className="ui">Site Settings</span> — site name, tagline, default description,
            logo, favicon, the default social-share image, footer copyright text, the site&apos;s
            own social links, and analytics/tracking snippets.
          </li>
          <li>
            <span className="ui">Permalinks</span> — the URL prefix for each content type (e.g.
            posts under <code>/blog</code>). Changing these changes the public addresses of
            existing content, so edit with care.
          </li>
        </ul>

        <h2 id="roles">Roles</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Role</th>
                <th>Can do</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>Admin</strong>
                </td>
                <td>Everything: manage users, change settings, edit all content.</td>
              </tr>
              <tr>
                <td>
                  <strong>Editor</strong>
                </td>
                <td>
                  Manage content and their own profile. Can&apos;t see other accounts, change
                  settings, or change roles.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          The CMS protects itself from lock-outs: the first account ever created is an admin, and
          the last remaining admin can&apos;t be deleted or demoted.
        </p>

        <h2>Publishing and the live site</h2>
        <p>
          Publishing, editing published content, or deleting something triggers a site rebuild
          automatically (when the deploy hook is configured) — changes appear live within a few
          minutes. Saving drafts never triggers a rebuild.
        </p>

        <footer>
          This guide ships with the CMS blueprint — the same text lives in the project as{' '}
          <code>EDITORS.md</code>.
        </footer>
      </div>
    </div>
  )
}
