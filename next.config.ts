import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Produce a minimal server bundle in .next/standalone for Docker deploys
  output: 'standalone',
  // libsql picks its native binding with a dynamically-constructed require
  // that file tracing can't follow — force the platform packages into the
  // standalone output (paths are the real pnpm store dirs, not symlinks)
  outputFileTracingIncludes: {
    '/**': ['./node_modules/.pnpm/libsql@*/**/*', './node_modules/.pnpm/@libsql+*/**/*'],
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
