import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms & Conditions — ReddyExch',
  description:
    'Read the Terms & Conditions for ReddyExch. 18+ only. Not available in Telangana or Andhra Pradesh. Not a gaming or gambling service.',
  alternates: {
    canonical: 'https://reddyexchgaming.com/terms',
  },
  robots: { index: true, follow: true },
}

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-black mb-2">Terms &amp; Conditions</h1>
      <p className="text-black/50 text-sm mb-10">Last updated: January 2025</p>

      {/* Eligibility */}
      <section className="mb-10" aria-labelledby="eligibility">
        <h2 id="eligibility" className="text-xl font-semibold text-black mb-3">
          1. Eligibility
        </h2>
        <p className="text-black/70 text-sm leading-relaxed mb-3">
          By accessing or using ReddyExch, you confirm that:
        </p>
        <ul className="list-disc list-inside text-black/70 text-sm space-y-2">
          <li>
            You are at least <strong>18 years of age</strong>. This service is strictly
            for adults. Minors are prohibited from using this platform.
          </li>
          <li>
            You are not a resident of <strong>Telangana</strong> or{' '}
            <strong>Andhra Pradesh</strong>. Due to local regulations, residents of these
            states are not eligible to use this service.
          </li>
          <li>
            You have the legal capacity to enter into a binding agreement under the laws
            of your jurisdiction.
          </li>
          <li>
            Your use of this service complies with all applicable local, state, and
            national laws and regulations.
          </li>
        </ul>
      </section>

      {/* Nature of Service */}
      <section className="mb-10" aria-labelledby="nature-of-service">
        <h2 id="nature-of-service" className="text-xl font-semibold text-black mb-3">
          2. Nature of Service
        </h2>
        <p className="text-black/70 text-sm leading-relaxed mb-3">
          ReddyExch provides gaming IDs for online sports prediction and fantasy
          participation platforms.{' '}
          <strong>
            This is not a gaming, gambling, or wagering service.
          </strong>{' '}
          ReddyExch does not operate any gaming platform, accept deposits, or facilitate
          any financial transactions related to gaming outcomes.
        </p>
        <p className="text-black/70 text-sm leading-relaxed">
          ReddyExch acts solely as an intermediary to help users obtain gaming IDs from
          third-party platforms. All gaming activities occur on those third-party platforms,
          which have their own terms and conditions.
        </p>
      </section>

      {/* User Responsibilities */}
      <section className="mb-10" aria-labelledby="user-responsibilities">
        <h2 id="user-responsibilities" className="text-xl font-semibold text-black mb-3">
          3. User Responsibilities
        </h2>
        <ul className="list-disc list-inside text-black/70 text-sm space-y-2">
          <li>
            You are solely responsible for ensuring that your use of any gaming platform
            complies with the laws and regulations of your jurisdiction.
          </li>
          <li>
            You acknowledge that online sports prediction and fantasy participation may be
            regulated or prohibited in certain jurisdictions.
          </li>
          <li>
            You agree not to use this service if you are located in a jurisdiction where
            such activities are prohibited.
          </li>
          <li>
            You are responsible for maintaining the confidentiality of your gaming ID and
            account credentials.
          </li>
          <li>
            You agree not to share your gaming ID with minors or use it on behalf of
            minors.
          </li>
        </ul>
      </section>

      {/* Prohibited Jurisdictions */}
      <section className="mb-10" aria-labelledby="prohibited-jurisdictions">
        <h2 id="prohibited-jurisdictions" className="text-xl font-semibold text-black mb-3">
          4. Prohibited Jurisdictions
        </h2>
        <p className="text-black/70 text-sm leading-relaxed mb-3">
          This service is not available to residents of the following jurisdictions:
        </p>
        <ul className="list-disc list-inside text-black/70 text-sm space-y-2">
          <li>
            <strong>Telangana, India</strong> — in compliance with the Telangana Gaming
            Act and India Online Gaming Rules 2026.
          </li>
          <li>
            <strong>Andhra Pradesh, India</strong> — in compliance with the Andhra Pradesh
            Gaming Act and India Online Gaming Rules 2026.
          </li>
        </ul>
        <p className="text-black/70 text-sm mt-3">
          Additional jurisdictions may be added as regulations evolve. It is your
          responsibility to check whether this service is available in your location.
        </p>
      </section>

      {/* Disclaimer of Liability */}
      <section className="mb-10" aria-labelledby="disclaimer">
        <h2 id="disclaimer" className="text-xl font-semibold text-black mb-3">
          5. Disclaimer of Liability
        </h2>
        <p className="text-black/70 text-sm leading-relaxed">
          ReddyExch provides this service on an &quot;as is&quot; basis without warranties of any
          kind. ReddyExch is not liable for any losses, damages, or legal consequences
          arising from your use of third-party gaming platforms. You participate in online
          sports prediction and fantasy platforms entirely at your own risk.
        </p>
      </section>

      {/* Changes to Terms */}
      <section className="mb-10" aria-labelledby="changes">
        <h2 id="changes" className="text-xl font-semibold text-black mb-3">
          6. Changes to These Terms
        </h2>
        <p className="text-black/70 text-sm leading-relaxed">
          ReddyExch reserves the right to update these Terms &amp; Conditions at any time.
          Continued use of the service after changes constitutes acceptance of the updated
          terms. We recommend reviewing this page periodically.
        </p>
      </section>

      {/* Links */}
      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/privacy-policy" className="text-red hover:underline">
          Privacy Policy
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
