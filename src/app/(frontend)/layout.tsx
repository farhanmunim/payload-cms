import React from 'react'
import './styles.css'

export const metadata = {
  title: 'Farhan.app CMS',
  description: 'Headless content API.',
  robots: 'noindex, nofollow',
}

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
