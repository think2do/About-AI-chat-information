export function mediaImageURL(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') return undefined

  const media = value as { filename?: unknown; mimeType?: unknown; prefix?: unknown; url?: unknown }
  if (typeof media.mimeType === 'string' && !media.mimeType.startsWith('image/')) return undefined

  if (typeof media.url === 'string' && media.url) {
    if (media.url.startsWith('/api/media/file/')) return media.url

    try {
      const url = new URL(media.url)
      if (!['http:', 'https:'].includes(url.protocol)) return undefined
      if (url.pathname.startsWith('/api/media/file/')) return `${url.pathname}${url.search}`

      return media.url
    } catch {
      // Fall through to the stable Payload proxy URL when a stored URL is invalid.
    }
  }

  if (typeof media.filename === 'string' && media.filename) {
    const encodedFilename = media.filename
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/')
    const prefix =
      typeof media.prefix === 'string' && media.prefix
        ? `?prefix=${encodeURIComponent(media.prefix)}`
        : ''

    return `/api/media/file/${encodedFilename}${prefix}`
  }

  return undefined
}
