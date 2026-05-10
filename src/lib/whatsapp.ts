import type { PlatformConfig } from '@/types'

/**
 * Builds a WhatsApp deep-link URL.
 * mobile  → wa.me (opens native app)
 * desktop → web.whatsapp.com (opens web client)
 * Returns null if phone or sourceUrl is invalid.
 */
export function buildWhatsAppUrl(
  phone: string,
  sourceUrl: string,
  deviceType: 'mobile' | 'desktop'
): string | null {
  // Validate sourceUrl
  try {
    new URL(sourceUrl)
  } catch {
    return null
  }

  // Strip non-digit chars from phone, keep leading +
  const cleanPhone = phone.replace(/[^\d]/g, '')
  if (!cleanPhone) return null

  const message = encodeURIComponent(`Hi, I want to get my Gaming ID — ${sourceUrl}`)

  if (deviceType === 'mobile') {
    return `https://wa.me/${cleanPhone}?text=${message}`
  }
  return `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${message}`
}

/**
 * Validates an activation label (≤60 chars, non-empty).
 */
export function validateActivationLabel(label: string): boolean {
  if (!label || label.trim().length === 0) return false
  return label.length <= 60
}

/**
 * Resolves the CTA target URL.
 * Returns a WhatsApp URL if config has a valid whatsappNumber,
 * otherwise falls back to fallbackContactPhone or fallbackContactEmail.
 */
export function resolveCTATarget(
  config: PlatformConfig,
  sourceUrl: string,
  deviceType: 'mobile' | 'desktop'
): string {
  const waUrl = buildWhatsAppUrl(config.whatsappNumber, sourceUrl, deviceType)
  if (waUrl) return waUrl

  // Fallback: phone link
  if (config.fallbackContactPhone) {
    return `tel:${config.fallbackContactPhone}`
  }

  // Fallback: mailto
  if (config.fallbackContactEmail) {
    return `mailto:${config.fallbackContactEmail}`
  }

  // Last resort
  return '#'
}
