import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'
import React from 'react'

import config from '@payload-config'

export const metadata = {
  title: 'Analytics',
  description: 'Site analytics dashboard.',
}

// Always rendered per-request: the page checks the viewer's CMS login
export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await getHeaders() })

  if (!user) {
    return (
      <div className="center">
        <p>
          Please <a href="/admin">log in to the CMS</a> to view analytics.
        </p>
      </div>
    )
  }

  const settings = await payload.findGlobal({ slug: 'site-settings' })
  const url = settings?.analyticsShareUrl

  if (!url) {
    return (
      <div className="center">
        <p>
          No analytics link configured. An admin can add a read-only Umami share URL under{' '}
          <a href="/admin/globals/site-settings">Site Settings</a>.
        </p>
      </div>
    )
  }

  return (
    <iframe
      src={url}
      title="Analytics"
      style={{ border: 0, width: '100%', height: '100vh', display: 'block' }}
    />
  )
}
