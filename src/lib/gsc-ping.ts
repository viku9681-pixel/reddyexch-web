/**
 * Pings Google Search Console to notify of a new/updated sitemap.
 * Non-throwing — always returns a success/failure object.
 */
export async function pingSitemapToGSC(
  sitemapUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate the sitemap URL
    new URL(sitemapUrl)

    const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`

    const response = await fetch(pingUrl, {
      method: 'GET',
      // 10 second timeout
      signal: AbortSignal.timeout(10_000),
    })

    if (response.ok) {
      return { success: true }
    }

    return {
      success: false,
      error: `GSC ping returned HTTP ${response.status}`,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.warn('[gsc-ping] Failed to ping GSC:', message)
    return { success: false, error: message }
  }
}
