export const color = {
  canvas: 'var(--job-canvas)',
  surface: 'var(--job-surface)',
  surfaceSubtle: 'var(--job-surface-subtle)',
  borderSubtle: 'var(--job-border-subtle)',
  border: 'var(--job-border)',
  borderStrong: 'var(--job-border-strong)',
  textPrimary: 'var(--job-text-primary)',
  textSecondary: 'var(--job-text-secondary)',
  textTertiary: 'var(--job-text-tertiary)',
  textDisabled: 'var(--job-text-disabled)',
  brandYellow: 'var(--job-brand-yellow)',
  brandYellowStrong: 'var(--job-brand-yellow-strong)',
  brandYellowTint: 'var(--job-brand-yellow-tint)',
  ctaBg: 'var(--job-cta-bg)',
  ctaText: 'var(--job-cta-text)',
  ctaHover: 'var(--job-cta-hover)',
  link: 'var(--job-accent-link)',
  blue: 'var(--job-semantic-blue)',
  purple: 'var(--job-semantic-purple)',
  orange: 'var(--job-semantic-orange)',
  red: 'var(--job-semantic-red)',
  teal: 'var(--job-semantic-teal)',
} as const

export const mono = 'JetBrains Mono, monospace'
export const sans = 'Inter, sans-serif'

export const radius = { xs: 4, sm: 6, md: 10, lg: 14, pill: 9999 } as const

export function chip(accent: string) {
  return {
    fontSize: 11,
    fontFamily: mono,
    padding: '2px 8px',
    borderRadius: radius.xs,
    color: accent,
    background: `color-mix(in srgb, ${accent} 12%, transparent)`,
    border: `1px solid color-mix(in srgb, ${accent} 30%, transparent)`,
    whiteSpace: 'nowrap' as const,
  }
}

export const paneBorder = `1px solid ${color.borderSubtle}`
