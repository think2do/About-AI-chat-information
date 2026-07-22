import Image from 'next/image'

export function VisualPlaceholder({
  alt,
  className = '',
  label,
  url,
}: {
  alt: string
  className?: string
  label: string
  url?: null | string
}) {
  return (
    <div className={`visual-placeholder ${className}`}>
      {url ? (
        <Image alt={alt} fill sizes="(max-width: 760px) 100vw, 50vw" src={url} />
      ) : (
        <span>{label}</span>
      )}
    </div>
  )
}
