/**
 * Server-safe device type detection from User-Agent string.
 * Works in both Node.js (server components, API routes) and browser.
 */
export function getDeviceType(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  if (!userAgent) return 'desktop'

  const ua = userAgent.toLowerCase()

  // Tablet patterns — check before mobile (iPads can match mobile patterns)
  const tabletPattern =
    /ipad|tablet|playbook|silk|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|fire|nexus 7|nexus 10/i
  if (tabletPattern.test(ua)) return 'tablet'

  // Mobile patterns
  const mobilePattern =
    /android.*mobile|iphone|ipod|blackberry|iemobile|opera mini|mobile|phone|windows phone|bb10|meego|palm|symbian|webos|bada|tizen|fennec|minimo|netfront|maemo|bolt|up\.browser|up\.link|mmp|smartphone|midp|wap|xda|j2me/i
  if (mobilePattern.test(ua)) return 'mobile'

  return 'desktop'
}
