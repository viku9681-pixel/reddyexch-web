import type { ContentPage } from '@/types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://reddyexchgaming.com'
const ORG_NAME = 'ReddyExch'
const ORG_URL = SITE_URL

export function generateOrganizationSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: ORG_NAME,
    url: ORG_URL,
    logo: `${ORG_URL}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: ['English', 'Hindi'],
    },
    sameAs: [],
  }
}

export function generateWebPageSchema(page: {
  title: string
  metaDesc: string
  canonical: string
  publishedAt?: Date | string
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.metaDesc,
    url: page.canonical,
    ...(page.publishedAt
      ? { datePublished: new Date(page.publishedAt).toISOString() }
      : {}),
    publisher: {
      '@type': 'Organization',
      name: ORG_NAME,
      url: ORG_URL,
    },
  }
}

export function generateArticleSchema(page: {
  title: string
  metaDesc: string
  canonical: string
  publishedAt?: Date | string
  updatedAt?: Date | string
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.title,
    description: page.metaDesc,
    url: page.canonical,
    ...(page.publishedAt
      ? { datePublished: new Date(page.publishedAt).toISOString() }
      : {}),
    ...(page.updatedAt
      ? { dateModified: new Date(page.updatedAt).toISOString() }
      : {}),
    author: {
      '@type': 'Organization',
      name: ORG_NAME,
      url: ORG_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: ORG_NAME,
      url: ORG_URL,
    },
  }
}

export function generateBreadcrumbSchema(slug: string, h1: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: ORG_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: h1,
        item: `${ORG_URL}/keyword/${slug}`,
      },
    ],
  }
}

export function generateFAQSchema(
  faqItems: { question: string; answer: string }[]
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function generateHowToSchema(
  steps: { name: string; text: string; image?: string }[]
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Get Your Cricket Gaming ID',
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image ? { image: step.image } : {}),
    })),
  }
}

export function generateStructuredData(
  page: Partial<ContentPage> & {
    title: string
    metaDesc: string
    canonical: string
    publishedAt?: Date | string
    updatedAt?: Date | string
  },
  options?: {
    includeBreadcrumb?: boolean
    breadcrumbSlug?: string
  }
): object[] {
  const schemas: object[] = [
    generateOrganizationSchema(),
    generateWebPageSchema(page),
  ]

  // Article schema for keyword_landing and content pages
  if (page.pageType === 'keyword_landing' || page.pageType === 'content') {
    schemas.push(generateArticleSchema(page))
  }

  // Breadcrumb for keyword landing pages
  if (options?.includeBreadcrumb && options.breadcrumbSlug && page.h1) {
    schemas.push(generateBreadcrumbSchema(options.breadcrumbSlug, page.h1))
  }

  // FAQ schema
  if (page.hasFaq && page.faqItems && page.faqItems.length > 0) {
    schemas.push(generateFAQSchema(page.faqItems))
  }

  // HowTo schema
  if (page.hasHowto && page.howtoSteps && page.howtoSteps.length > 0) {
    schemas.push(generateHowToSchema(page.howtoSteps))
  }

  return schemas
}
