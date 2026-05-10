/**
 * Seeds 30 keyword landing pages into content_pages table
 * Run: node scripts/seed-keyword-pages.mjs
 */
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://djirwwtijunzrpanfxwa.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqaXJ3d3RpanVuenJwYW5meHdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODQwODU1NSwiZXhwIjoyMDkzOTg0NTU1fQ.dsCtVODdWUop-qwP2oWttc7JFhRftPUhW-bMu-0c9F0',
  { auth: { persistSession: false } }
)

const SITE_URL = 'https://reddyexchgaming.com'
const WA_NUMBER = '919999999999'

function buildWAUrl(slug) {
  const msg = encodeURIComponent(`Hi, I want to get my Gaming ID — ${SITE_URL}/keyword/${slug}`)
  return `https://wa.me/${WA_NUMBER}?text=${msg}`
}

function slugToKeyword(slug) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

const KEYWORDS = [
  { slug: 'online-cricket-id',                  tier: 'primary',   pillar: null },
  { slug: 'whatsapp-cricket-id',                tier: 'primary',   pillar: null },
  { slug: 'instant-cricket-id',                 tier: 'secondary', pillar: 'online-cricket-id' },
  { slug: 'cricket-betting-id',                 tier: 'secondary', pillar: 'online-cricket-id' },
  { slug: 'reddy-anna-book',                    tier: 'secondary', pillar: 'online-cricket-id' },
  { slug: 'diamond-exch',                       tier: 'secondary', pillar: 'online-cricket-id' },
  { slug: 'fairplay-id',                        tier: 'secondary', pillar: 'online-cricket-id' },
  { slug: 'lotus365-id',                        tier: 'secondary', pillar: 'online-cricket-id' },
  { slug: 'mahadev-book',                       tier: 'secondary', pillar: 'online-cricket-id' },
  { slug: 'sky-exchange-id',                    tier: 'secondary', pillar: 'online-cricket-id' },
  { slug: 'betbhai9-id',                        tier: 'secondary', pillar: 'online-cricket-id' },
  { slug: 'world777-id',                        tier: 'secondary', pillar: 'online-cricket-id' },
  { slug: 'tigerexch-id',                       tier: 'secondary', pillar: 'online-cricket-id' },
  { slug: 'online-gaming-id-india',             tier: 'secondary', pillar: 'online-cricket-id' },
  { slug: 'how-to-get-cricket-id-via-whatsapp', tier: 'long_tail', pillar: 'whatsapp-cricket-id' },
  { slug: 'best-ipl-betting-id-india',          tier: 'long_tail', pillar: 'online-cricket-id' },
  { slug: 'cricket-id-kaise-banaye',            tier: 'long_tail', pillar: 'online-cricket-id' },
  { slug: 'online-cricket-id-free',             tier: 'long_tail', pillar: 'online-cricket-id' },
  { slug: 'cricket-id-whatsapp-number-india',   tier: 'long_tail', pillar: 'whatsapp-cricket-id' },
  { slug: 'instant-cricket-id-whatsapp',        tier: 'long_tail', pillar: 'whatsapp-cricket-id' },
  { slug: 'trusted-cricket-id-provider-india',  tier: 'long_tail', pillar: 'online-cricket-id' },
  { slug: 'cricket-id-5-minutes',               tier: 'long_tail', pillar: 'whatsapp-cricket-id' },
  { slug: 'ipl-2025-cricket-id',                tier: 'long_tail', pillar: 'online-cricket-id' },
  { slug: 't20-world-cup-cricket-id',           tier: 'long_tail', pillar: 'online-cricket-id' },
  { slug: 'online-sports-prediction-id-india',  tier: 'long_tail', pillar: 'online-cricket-id' },
  { slug: 'fantasy-cricket-id-india',           tier: 'long_tail', pillar: 'online-cricket-id' },
  { slug: 'cricket-id-registration-online',     tier: 'long_tail', pillar: 'online-cricket-id' },
  { slug: 'new-cricket-id-2025',                tier: 'long_tail', pillar: 'online-cricket-id' },
  { slug: 'reddyexch-cricket-id',               tier: 'long_tail', pillar: 'online-cricket-id' },
  { slug: 'whatsapp-se-gaming-id-kaise-le',     tier: 'long_tail', pillar: 'whatsapp-cricket-id' },
]

function buildContent(slug, keyword) {
  const waUrl = buildWAUrl(slug)
  const kw = keyword.toLowerCase()

  return `<h1>${keyword} — Get Yours Instantly via WhatsApp</h1>

<p>ReddyExch provides gaming IDs for online sports prediction and fantasy participation platforms. Get your ${kw} in just 5 minutes via WhatsApp — no paperwork, no waiting, available 24/7.</p>

<p>Whether you're looking for a ${kw} for IPL, T20, or any other cricket tournament, ReddyExch makes the process instant and hassle-free. Our team is available round the clock to activate your gaming ID within minutes of your WhatsApp request.</p>

<h2>How to Get Your ${keyword}</h2>

<p>Getting your ${kw} is simple. Follow these three easy steps:</p>

<ol>
<li><strong>Click the WhatsApp button</strong> on this page. It opens a pre-filled message addressed to our team.</li>
<li><strong>Send the message</strong> and let us know which platform you want your ID for.</li>
<li><strong>Receive your gaming ID</strong> within 5 minutes. Our team responds instantly.</li>
</ol>

<p>Once you have your ${kw}, you can start participating in online sports prediction contests, fantasy leagues, and skill-based gaming activities on platforms like Diamond Exch, Fairplay, Lotus365, Sky Exchange, Mahadev Book, and more.</p>

<h2>Why Choose ReddyExch for Your ${keyword}?</h2>

<p>ReddyExch is trusted by over 10,000 players across India for reliable gaming ID services. Here's why players choose us:</p>

<ul>
<li><strong>Instant activation</strong> — your ${kw} is ready within 5 minutes</li>
<li><strong>24/7 WhatsApp support</strong> — our team never sleeps</li>
<li><strong>All major platforms</strong> — IDs available for Diamond Exch, Fairplay, Lotus365, Sky Exchange, Mahadev Book, Reddy Anna, and more</li>
<li><strong>Secure and confidential</strong> — your information is handled with strict privacy</li>
<li><strong>No hidden charges</strong> — transparent service with no surprises</li>
</ul>

<h2>What is a ${keyword}?</h2>

<p>A ${kw} is your unique identifier on online sports prediction and fantasy participation platforms. With your gaming ID, you can participate in skill-based contests, predict match outcomes, and engage with fantasy sports leagues.</p>

<p>ReddyExch provides gaming IDs for sports prediction and fantasy participation platforms only. This is not a gaming or gambling service. All activities on the platforms are skill-based and subject to the platform's own terms and conditions.</p>

<h2>Frequently Asked Questions</h2>

<h3>How long does it take to get my ${kw}?</h3>
<p>Your ${kw} is activated within 5 minutes of your WhatsApp request. Our team is available 24/7 to process your request instantly.</p>

<h3>Which platforms can I get a gaming ID for?</h3>
<p>We provide gaming IDs for all major platforms including Diamond Exch, Fairplay, Lotus365, Sky Exchange, Mahadev Book, Reddy Anna Book, Betbhai9, World777, Tiger Exchange, and more.</p>

<h3>Is this service available in my state?</h3>
<p>This service is available across India except Telangana and Andhra Pradesh, in compliance with India Online Gaming Rules 2026.</p>

<h3>How do I contact ReddyExch?</h3>
<p>Contact us via WhatsApp for the fastest response. Click the WhatsApp button on this page to start a conversation with our team.</p>

<div class="cta-block">
<p><strong>Ready to get your ${keyword}?</strong></p>
<p>Contact us on WhatsApp now and get your gaming ID in 5 minutes.</p>
<a href="${waUrl}" target="_blank" rel="noopener noreferrer">Get ${keyword} on WhatsApp →</a>
</div>

<p><em>ReddyExch provides gaming IDs for online sports prediction and fantasy participation platforms. This is not a gaming or gambling service. 18+ only. Not available in Telangana and Andhra Pradesh.</em></p>`
}

async function seed() {
  console.log('Seeding 30 keyword landing pages...\n')

  let success = 0
  let skipped = 0

  for (const { slug, tier } of KEYWORDS) {
    const keyword = slugToKeyword(slug)
    const title = `${keyword} | Get Your Gaming ID Instantly — ReddyExch`
    const metaDesc = `Get your ${keyword.toLowerCase()} instantly via WhatsApp. ReddyExch provides gaming IDs for sports prediction platforms. 5-minute activation. 18+ only.`
    const bodyRaw = buildContent(slug, keyword)
    const bodyHtml = bodyRaw // Same for now — auto-linker will process later

    const { error } = await supabase.from('content_pages').upsert({
      slug,
      title: title.slice(0, 60),
      meta_desc: metaDesc.slice(0, 160),
      h1: `${keyword} — Get Yours Instantly via WhatsApp`,
      body_html: bodyHtml,
      body_raw: bodyRaw,
      target_keyword: keyword.toLowerCase(),
      page_type: tier === 'primary' ? 'pillar' : 'keyword_landing',
      language: 'en',
      status: 'published',
      published_at: new Date().toISOString(),
      has_faq: true,
      seo_score: 75,
      internal_links: 2,
    }, { onConflict: 'slug' })

    if (error) {
      console.log(`  ❌ ${slug}: ${error.message}`)
    } else {
      console.log(`  ✅ ${slug}`)
      success++
    }
  }

  console.log(`\nDone: ${success} seeded, ${skipped} skipped`)
}

seed().catch(console.error)
