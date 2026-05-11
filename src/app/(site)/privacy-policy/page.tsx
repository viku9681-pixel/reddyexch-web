import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — ReddyExch',
  description:
    'ReddyExch Privacy Policy. We collect minimal data — session cookies, anonymous analytics, and compliance logs without IP addresses.',
  alternates: {
    canonical: 'https://reddyexchgaming.com/privacy-policy',
  },
  robots: { index: true, follow: true },
}

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-black mb-2">Privacy Policy</h1>
      <p className="text-black/50 text-sm mb-10">Last updated: January 2025</p>

      {/* Overview */}
      <section className="mb-10" aria-labelledby="overview">
        <h2 id="overview" className="text-xl font-semibold text-black mb-3">
          1. Overview
        </h2>
        <p className="text-black/70 text-sm leading-relaxed">
          ReddyExch is committed to protecting your privacy. We collect the minimum data
          necessary to operate this service. We do not collect, store, or sell personally
          identifiable information (PII) beyond what is required for session management
          and compliance purposes.
        </p>
      </section>

      {/* Data We Collect */}
      <section className="mb-10" aria-labelledby="data-collected">
        <h2 id="data-collected" className="text-xl font-semibold text-black mb-3">
          2. Data We Collect
        </h2>
        <p className="text-black/70 text-sm leading-relaxed mb-4">
          We collect only the following categories of data:
        </p>

        <div className="space-y-6">
          <div className="bg-black/5 rounded-xl p-5">
            <h3 className="font-semibold text-black text-sm mb-2">
              Session Cookie
            </h3>
            <p className="text-black/70 text-sm">
              A session cookie is set to manage your visit and compliance state (age
              verification, geo-block status). This cookie is:
            </p>
            <ul className="list-disc list-inside text-black/70 text-sm mt-2 space-y-1">
              <li>HttpOnly — not accessible by JavaScript</li>
              <li>Secure — transmitted only over HTTPS</li>
              <li>SameSite=Strict — not sent with cross-site requests</li>
              <li>Session-scoped — expires when you close your browser</li>
            </ul>
            <p className="text-black/70 text-sm mt-2">
              No name, email address, phone number, or other PII is stored in this cookie.
            </p>
          </div>

          <div className="bg-black/5 rounded-xl p-5">
            <h3 className="font-semibold text-black text-sm mb-2">
              Anonymous Analytics
            </h3>
            <p className="text-black/70 text-sm">
              We collect anonymous usage analytics to understand how visitors interact
              with our platform. This data:
            </p>
            <ul className="list-disc list-inside text-black/70 text-sm mt-2 space-y-1">
              <li>Does not include your IP address</li>
              <li>Does not include your name, email, or any PII</li>
              <li>Includes page views, scroll depth, and CTA interaction events</li>
              <li>Is associated with an anonymous session ID only</li>
              <li>Is used solely to improve the platform experience</li>
            </ul>
          </div>

          <div className="bg-black/5 rounded-xl p-5">
            <h3 className="font-semibold text-black text-sm mb-2">
              Compliance Logs
            </h3>
            <p className="text-black/70 text-sm">
              We maintain compliance logs to meet regulatory requirements. These logs:
            </p>
            <ul className="list-disc list-inside text-black/70 text-sm mt-2 space-y-1">
              <li>Record age verification confirmations and declines</li>
              <li>Record geo-block events</li>
              <li>Do not include your IP address</li>
              <li>Do not include your name, email, or any PII</li>
              <li>Are associated with an anonymous session ID only</li>
              <li>Are retained for a maximum of 90 days</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Data We Do NOT Collect */}
      <section className="mb-10" aria-labelledby="data-not-collected">
        <h2 id="data-not-collected" className="text-xl font-semibold text-black mb-3">
          3. Data We Do Not Collect
        </h2>
        <p className="text-black/70 text-sm leading-relaxed mb-3">
          ReddyExch does not collect:
        </p>
        <ul className="list-disc list-inside text-black/70 text-sm space-y-2">
          <li>Your name, email address, or phone number</li>
          <li>Your IP address (beyond what is technically required for routing)</li>
          <li>Payment or financial information</li>
          <li>Government-issued ID or identity documents</li>
          <li>Location data beyond country/state for geo-compliance purposes</li>
          <li>Biometric data</li>
        </ul>
      </section>

      {/* Third-Party Services */}
      <section className="mb-10" aria-labelledby="third-party">
        <h2 id="third-party" className="text-xl font-semibold text-black mb-3">
          4. Third-Party Services
        </h2>
        <p className="text-black/70 text-sm leading-relaxed mb-3">
          We use the following third-party services:
        </p>
        <ul className="list-disc list-inside text-black/70 text-sm space-y-2">
          <li>
            <strong>Google Analytics 4</strong> — anonymous usage analytics. Google&apos;s
            privacy policy applies.
          </li>
          <li>
            <strong>Supabase</strong> — database and session management. Data is stored
            on servers in the EU/US.
          </li>
          <li>
            <strong>Vercel</strong> — hosting and edge network. Vercel&apos;s privacy policy
            applies.
          </li>
        </ul>
        <p className="text-black/70 text-sm mt-3">
          When you click a WhatsApp CTA, you are redirected to WhatsApp. WhatsApp&apos;s
          privacy policy applies to any data shared through that platform.
        </p>
      </section>

      {/* Your Rights */}
      <section className="mb-10" aria-labelledby="your-rights">
        <h2 id="your-rights" className="text-xl font-semibold text-black mb-3">
          5. Your Rights
        </h2>
        <p className="text-black/70 text-sm leading-relaxed">
          Since we do not collect PII, there is no personal data to access, correct, or
          delete. If you have questions about our data practices, please contact us at{' '}
          <a
            href="mailto:support@reddyexchgaming.com"
            className="text-red hover:underline"
          >
            support@reddyexchgaming.com
          </a>
          .
        </p>
      </section>

      {/* Changes */}
      <section className="mb-10" aria-labelledby="changes">
        <h2 id="changes" className="text-xl font-semibold text-black mb-3">
          6. Changes to This Policy
        </h2>
        <p className="text-black/70 text-sm leading-relaxed">
          We may update this Privacy Policy from time to time. We will post the updated
          policy on this page with a revised &quot;Last updated&quot; date. Continued use of the
          service after changes constitutes acceptance of the updated policy.
        </p>
      </section>

      {/* Links */}
      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/terms" className="text-red hover:underline">
          Terms &amp; Conditions
        </Link>
        <Link href="/responsible-gaming" className="text-red hover:underline">
          Responsible Gaming
        </Link>
        <Link href="/" className="text-black/50 hover:text-black">
          ← Back to Home
        </Link>
      </div>
    </main>
  )
}
