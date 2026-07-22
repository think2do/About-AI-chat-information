import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

function getStorageRemotePattern() {
  const configuredURL = process.env.S3_PUBLIC_URL?.trim()
  if (!configuredURL) return undefined

  try {
    const url = new URL(configuredURL)
    if (!['http:', 'https:'].includes(url.protocol)) return undefined

    url.pathname = `${url.pathname.replace(/\/+$/, '')}/**`
    url.search = ''
    url.hash = ''
    return url
  } catch {
    return undefined
  }
}

const storageRemotePattern = getStorageRemotePattern()

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
    ...(storageRemotePattern ? { remotePatterns: [storageRemotePattern] } : {}),
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
