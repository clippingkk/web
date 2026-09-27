import type { Metadata } from 'next'

import { APP_URL_ORIGIN } from '@/constants/config'

type PageMetadataInput = {
  title: string
  description?: string
  /** Path of the canonical URL, e.g. `/dash/annatar/home`. */
  path?: string
  image?: string | null
  type?: 'website' | 'article' | 'profile' | 'book'
}

/** Consistent title, description, canonical and social cards for a page. */
export function pageMetadata(input: PageMetadataInput): Metadata {
  const { title, description, path, image, type = 'website' } = input
  const fullTitle = title ? `${title} · ClippingKK` : 'ClippingKK'
  const url = path ? `${APP_URL_ORIGIN}${path}` : undefined
  return {
    metadataBase: new URL(APP_URL_ORIGIN),
    title: fullTitle,
    description,
    alternates: url ? { canonical: url } : undefined,
    openGraph: {
      type: type === 'book' || type === 'profile' ? 'website' : type,
      url,
      title: fullTitle,
      description,
      siteName: 'ClippingKK',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      site: '@AnnatarHe',
      creator: '@AnnatarHe',
      title: fullTitle,
      description,
      images: image ? [image] : undefined,
    },
  }
}
