import type { Metadata } from 'next'
import type { SEOHeadProps } from '@/types'

/**
 * Generates Next.js Metadata from SEO props.
 * Use this in generateMetadata() functions in page.tsx files.
 */
export function generateSEOMetadata(props: SEOHeadProps): Metadata {
  const {
    title,
    description,
    canonical,
    noindex = false,
    lcpImageUrl,
    hreflang,
  } = props

  const metadata: Metadata = {
    title,
    description,
    alternates: {
      canonical,
      ...(hreflang && hreflang.length > 0
        ? {
            languages: Object.fromEntries(
              hreflang.map(({ lang, url }) => [lang, url])
            ),
          }
        : {}),
    },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      siteName: 'ReddyExch',
      locale: 'en_IN',
      ...(lcpImageUrl ? { images: [{ url: lcpImageUrl }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(lcpImageUrl ? { images: [lcpImageUrl] } : {}),
    },
  }

  return metadata
}

/**
 * Server component that renders JSON-LD structured data script tags.
 * Place inside <head> or at the top of a page component.
 */
export default function SEOHead({ structuredData }: Pick<SEOHeadProps, 'structuredData'>) {
  if (!structuredData || structuredData.length === 0) return null

  return (
    <>
      {structuredData.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}
