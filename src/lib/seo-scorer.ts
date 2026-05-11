/**
 * SEO Scorer — evaluates content against SEO best practices
 * Returns a score 0–100 with per-criterion breakdown and suggestions
 */

export interface SEOCriterion {
  score: number
  pass: boolean
  warn?: boolean
  current: string
  required: string
}

export interface SEOScoreResult {
  total: number
  breakdown: {
    keywordDensity:    SEOCriterion
    keywordInFirst100: SEOCriterion
    titleLength:       SEOCriterion
    descLength:        SEOCriterion
    exactMatchH1:      SEOCriterion
    headingStructure:  SEOCriterion
    internalLinks:     SEOCriterion
    contentLength:     SEOCriterion
    structuredData:    SEOCriterion
  }
  suggestions: { criterion: string; message: string; currentValue: string; requiredValue: string }[]
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

function getFirst100Words(bodyRaw: string): string {
  return bodyRaw.trim().split(/\s+/).slice(0, 100).join(' ')
}

function getH1Text(bodyHtml: string): string {
  const match = bodyHtml.match(/<h1[^>]*>(.*?)<\/h1>/i)
  return match ? stripHtml(match[1]) : ''
}

function hasValidHeadingHierarchy(bodyHtml: string): boolean {
  const h1Count = (bodyHtml.match(/<h1/gi) ?? []).length
  if (h1Count !== 1) return false
  // Check no h3 appears before h2
  const h2Pos = bodyHtml.search(/<h2/i)
  const h3Pos = bodyHtml.search(/<h3/i)
  if (h3Pos !== -1 && h2Pos === -1) return false
  if (h3Pos !== -1 && h3Pos < h2Pos) return false
  return true
}

function countInternalLinks(bodyHtml: string): number {
  const matches = bodyHtml.match(/href="\/[^"]+"/g) ?? []
  return matches.length
}

export function scorePage(params: {
  title: string
  metaDesc: string
  bodyRaw: string
  bodyHtml: string
  targetKeyword: string
  pageType: string
  internalLinks?: number
  hasFaq?: boolean
}): SEOScoreResult {
  const { title, metaDesc, bodyRaw, bodyHtml, targetKeyword, pageType } = params
  const isKLP = pageType === 'keyword_landing' || pageType === 'pillar'
  const plainText = stripHtml(bodyHtml || bodyRaw)
  const wordCount = countWords(plainText)
  const keyword = targetKeyword.toLowerCase().trim()

  const suggestions: SEOScoreResult['suggestions'] = []

  // ── 1. Keyword Density (weight: 15) ──
  const keywordOccurrences = keyword
    ? (plainText.toLowerCase().match(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length
    : 0
  const density = wordCount > 0 ? (keywordOccurrences / wordCount) * 100 : 0
  const densityPass = density >= 1.5 && density <= 3.0
  const densityWarn = density > 2.5 && density <= 3.0
  const densityScore = densityPass ? 15 : density > 0 && density < 1.5 ? 7 : 0
  if (!densityPass) {
    suggestions.push({
      criterion: 'Keyword Density',
      message: density > 3 ? `Keyword density is ${density.toFixed(1)}% — reduce below 3% to avoid over-optimisation` : `Keyword density is ${density.toFixed(1)}% — increase to 1.5–2.5%`,
      currentValue: `${density.toFixed(1)}%`,
      requiredValue: '1.5%–2.5%',
    })
  }

  // ── 2. Keyword in First 100 Words (weight: 10) ──
  const first100 = getFirst100Words(bodyRaw || plainText)
  const inFirst100 = keyword ? first100.toLowerCase().includes(keyword) : false
  const first100Score = inFirst100 ? 10 : 0
  if (!inFirst100 && keyword) {
    suggestions.push({
      criterion: 'Keyword in First 100 Words',
      message: `Target keyword "${keyword}" not found in the first 100 words`,
      currentValue: 'Absent',
      requiredValue: 'Present',
    })
  }

  // ── 3. Title Length (weight: 15) ──
  const titleLen = title.length
  const titleMin = isKLP ? 50 : 10
  const titleMax = 60
  const titlePass = titleLen >= titleMin && titleLen <= titleMax
  const titleScore = titlePass ? 15 : titleLen > 0 ? 7 : 0
  if (!titlePass) {
    suggestions.push({
      criterion: 'Meta Title Length',
      message: `Title is ${titleLen} chars — should be ${titleMin}–${titleMax} chars`,
      currentValue: `${titleLen} chars`,
      requiredValue: `${titleMin}–${titleMax} chars`,
    })
  }

  // ── 4. Meta Description Length (weight: 10) ──
  const descLen = metaDesc.length
  const descMin = isKLP ? 150 : 50
  const descMax = isKLP ? 160 : 160
  const descPass = descLen >= descMin && descLen <= descMax
  const descScore = descPass ? 10 : descLen > 0 ? 5 : 0
  if (!descPass) {
    suggestions.push({
      criterion: 'Meta Description Length',
      message: `Description is ${descLen} chars — should be ${descMin}–${descMax} chars`,
      currentValue: `${descLen} chars`,
      requiredValue: `${descMin}–${descMax} chars`,
    })
  }

  // ── 5. Exact-match keyword in H1 (weight: 15) ──
  const h1Text = getH1Text(bodyHtml)
  const h1Pass = keyword ? h1Text.toLowerCase().includes(keyword) : h1Text.length > 0
  const h1Score = h1Pass ? 15 : 0
  if (!h1Pass) {
    suggestions.push({
      criterion: 'Keyword in H1',
      message: `Target keyword "${keyword}" not found in the first H1 element`,
      currentValue: h1Text || 'No H1 found',
      requiredValue: `H1 containing "${keyword}"`,
    })
  }

  // ── 6. Heading Structure (weight: 10) ──
  const headingPass = hasValidHeadingHierarchy(bodyHtml)
  const headingScore = headingPass ? 10 : 0
  if (!headingPass) {
    suggestions.push({
      criterion: 'Heading Structure',
      message: 'Heading hierarchy is invalid — ensure exactly one H1, and H3s only appear after H2s',
      currentValue: 'Invalid hierarchy',
      requiredValue: 'One H1, valid H2/H3 hierarchy',
    })
  }

  // ── 7. Internal Links (weight: 10) ──
  const linkCount = params.internalLinks ?? countInternalLinks(bodyHtml)
  const linksPass = linkCount >= 2
  const linksScore = linksPass ? 10 : linkCount === 1 ? 5 : 0
  if (!linksPass) {
    suggestions.push({
      criterion: 'Internal Links',
      message: `Only ${linkCount} internal link(s) found — add at least 2`,
      currentValue: `${linkCount} links`,
      requiredValue: '≥2 internal links',
    })
  }

  // ── 8. Content Length (weight: 10) ──
  const lengthPass = wordCount >= 600
  const lengthScore = lengthPass ? 10 : wordCount >= 300 ? 5 : 0
  if (!lengthPass) {
    suggestions.push({
      criterion: 'Content Length',
      message: `Content is ${wordCount} words — add more to reach 600+ words`,
      currentValue: `${wordCount} words`,
      requiredValue: '≥600 words',
    })
  }

  // Structured Data (weight: 5) — always injected server-side
  const sdScore = 5
  const sdPass = true

  const total = Math.min(100, Math.round(
    densityScore + first100Score + titleScore + descScore +
    h1Score + headingScore + linksScore + lengthScore + sdScore
  ))

  return {
    total,
    breakdown: {
      keywordDensity:    { score: densityScore,  pass: densityPass,  warn: densityWarn, current: `${density.toFixed(1)}%`, required: '1.5–2.5%' },
      keywordInFirst100: { score: first100Score, pass: inFirst100,   current: inFirst100 ? 'Present' : 'Absent', required: 'Present' },
      titleLength:       { score: titleScore,    pass: titlePass,    current: `${titleLen} chars`, required: `${titleMin}–${titleMax} chars` },
      descLength:        { score: descScore,     pass: descPass,     current: `${descLen} chars`, required: `${descMin}–${descMax} chars` },
      exactMatchH1:      { score: h1Score,       pass: h1Pass,       current: h1Text || 'No H1', required: `Contains "${keyword}"` },
      headingStructure:  { score: headingScore,  pass: headingPass,  current: headingPass ? 'Valid' : 'Invalid', required: 'One H1, valid hierarchy' },
      internalLinks:     { score: linksScore,    pass: linksPass,    current: `${linkCount}`, required: '≥2' },
      contentLength:     { score: lengthScore,   pass: lengthPass,   current: `${wordCount} words`, required: '≥600 words' },
      structuredData:    { score: sdScore,       pass: sdPass,       current: 'Auto-generated', required: 'Present' },
    },
    suggestions,
  }
}
