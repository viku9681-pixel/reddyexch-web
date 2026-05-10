import Link from 'next/link'

interface BreadcrumbNavProps {
  h1: string
  slug: string
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://reddyexchgaming.com'

/**
 * Renders a breadcrumb navigation: Home > {h1}
 * Also outputs BreadcrumbList JSON-LD inline.
 */
export default function BreadcrumbNav({ h1, slug }: BreadcrumbNavProps) {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: h1,
        item: `${SITE_URL}/keyword/${slug}`,
      },
    ],
  }

  return (
    <>
      {/* JSON-LD breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Visual breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol
          className="flex items-center gap-2 text-sm text-black/50"
          itemScope
          itemType="https://schema.org/BreadcrumbList"
        >
          <li
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            <Link
              href="/"
              className="hover:text-black transition-colors"
              itemProp="item"
            >
              <span itemProp="name">Home</span>
            </Link>
            <meta itemProp="position" content="1" />
          </li>

          <li aria-hidden="true">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="opacity-40"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </li>

          <li
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
            className="text-black font-medium truncate max-w-[200px] sm:max-w-none"
          >
            <span itemProp="name" aria-current="page">
              {h1}
            </span>
            <meta itemProp="position" content="2" />
          </li>
        </ol>
      </nav>
    </>
  )
}
