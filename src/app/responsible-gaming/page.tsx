import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Responsible Gaming — ReddyExch',
  description:
    'ReddyExch is committed to responsible gaming. Learn about self-exclusion, deposit limits, and support resources including iCall helpline 9152987821.',
  alternates: {
    canonical: 'https://reddyexchgaming.com/responsible-gaming',
  },
  robots: { index: true, follow: true },
}

export default function ResponsibleGamingPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-black mb-2">Responsible Gaming</h1>
      <p className="text-black/60 text-sm mb-10">
        ReddyExch is committed to promoting responsible participation in online sports
        prediction and fantasy platforms.
      </p>

      {/* Self-Exclusion */}
      <section className="mb-10" aria-labelledby="self-exclusion">
        <h2 id="self-exclusion" className="text-xl font-semibold text-black mb-3">
          Self-Exclusion
        </h2>
        <p className="text-black/70 text-sm leading-relaxed mb-3">
          If you feel that your participation in online sports prediction or fantasy
          platforms is becoming problematic, you can request self-exclusion at any time.
        </p>
        <ul className="list-disc list-inside text-black/70 text-sm space-y-2">
          <li>
            Contact us via WhatsApp or email to request immediate account suspension.
          </li>
          <li>
            Self-exclusion periods are available for 30 days, 90 days, 6 months, or
            permanently.
          </li>
          <li>
            During self-exclusion, your gaming ID will be deactivated and you will not
            receive promotional communications.
          </li>
          <li>
            To reinstate your account after a self-exclusion period, you must contact
            support and complete a cooling-off period.
          </li>
        </ul>
      </section>

      {/* Deposit Limits */}
      <section className="mb-10" aria-labelledby="deposit-limits">
        <h2 id="deposit-limits" className="text-xl font-semibold text-black mb-3">
          Deposit Limit Guidance
        </h2>
        <p className="text-black/70 text-sm leading-relaxed mb-3">
          We encourage all users to set personal spending limits before participating in
          any online sports prediction platform. Consider the following guidelines:
        </p>
        <ul className="list-disc list-inside text-black/70 text-sm space-y-2">
          <li>Only participate with funds you can afford to lose.</li>
          <li>Set a daily, weekly, or monthly budget and stick to it.</li>
          <li>
            Contact the platform directly to set deposit limits on your account.
          </li>
          <li>
            Never chase losses — take a break if you feel frustrated or upset.
          </li>
          <li>
            Keep track of your spending by reviewing your transaction history regularly.
          </li>
        </ul>
      </section>

      {/* Warning Signs */}
      <section className="mb-10" aria-labelledby="warning-signs">
        <h2 id="warning-signs" className="text-xl font-semibold text-black mb-3">
          Warning Signs of Problem Gaming
        </h2>
        <ul className="list-disc list-inside text-black/70 text-sm space-y-2">
          <li>Spending more time or money than intended.</li>
          <li>Neglecting work, family, or social obligations.</li>
          <li>Borrowing money to fund participation.</li>
          <li>Feeling anxious, irritable, or depressed when not playing.</li>
          <li>Hiding your activity from friends or family.</li>
        </ul>
        <p className="text-black/70 text-sm mt-3">
          If you recognise any of these signs, please seek help immediately.
        </p>
      </section>

      {/* Support Resources */}
      <section className="mb-10" aria-labelledby="support">
        <h2 id="support" className="text-xl font-semibold text-black mb-3">
          Support Resources
        </h2>
        <div className="bg-black/5 rounded-xl p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-black text-sm mb-1">
              iCall — Psychosocial Helpline
            </h3>
            <p className="text-black/70 text-sm">
              Free, confidential counselling for mental health and problem gaming.
            </p>
            <a
              href="tel:9152987821"
              className="text-red font-semibold text-sm mt-1 inline-block hover:underline"
              aria-label="Call iCall helpline at 9152987821"
            >
              📞 9152987821
            </a>
          </div>

          <div>
            <h3 className="font-semibold text-black text-sm mb-1">
              All India Gaming Federation (AIGF)
            </h3>
            <p className="text-black/70 text-sm">
              AIGF promotes responsible online gaming practices across India.
            </p>
            <a
              href="https://aigf.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red font-semibold text-sm mt-1 inline-block hover:underline"
              aria-label="Visit AIGF website"
            >
              Visit aigf.in →
            </a>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="mb-10" aria-labelledby="disclaimer">
        <h2 id="disclaimer" className="text-xl font-semibold text-black mb-3">
          Important Disclaimer
        </h2>
        <p className="text-black/70 text-sm leading-relaxed">
          ReddyExch provides gaming IDs for online sports prediction and fantasy
          participation platforms. This is not a gaming or gambling service. Users are
          solely responsible for ensuring their participation complies with local laws and
          regulations. This service is strictly for users aged 18 and above. Residents of
          Telangana and Andhra Pradesh are not eligible to use this service.
        </p>
      </section>

      {/* Links */}
      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/terms" className="text-red hover:underline">
          Terms &amp; Conditions
        </Link>
        <Link href="/privacy-policy" className="text-red hover:underline">
          Privacy Policy
        </Link>
        <Link href="/" className="text-black/50 hover:text-black">
          ← Back to Home
        </Link>
      </div>
    </main>
  )
}
