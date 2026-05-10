export const revalidate = 60

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section — Phase 4 */}
      <section className="flex min-h-screen flex-col items-center justify-center bg-black text-white px-4">
        <h1 className="text-4xl font-bold text-center mb-4">
          Online Cricket ID — Get Yours Instantly
        </h1>
        <p className="text-lg text-center mb-8 max-w-xl">
          ReddyExch provides gaming IDs for online sports prediction and fantasy
          participation platforms. Get your ID in 5 minutes via WhatsApp.
        </p>
        <a
          href="https://wa.me/919999999999?text=Hi%2C%20I%20want%20to%20get%20my%20Gaming%20ID"
          className="bg-red text-white font-semibold px-8 py-4 rounded-full text-lg interactive"
          target="_blank"
          rel="noopener noreferrer"
        >
          Get Cricket ID on WhatsApp
        </a>
        <p className="mt-3 text-sm text-gray-400">Get your ID in 5 minutes</p>
      </section>

      {/* Responsible Gaming Disclaimer — static HTML, always present */}
      <p role="note" className="text-xs text-center text-gray-500 py-4 px-4">
        ReddyExch provides gaming IDs for online sports prediction and fantasy
        participation platforms. This is not a betting or gambling service.
      </p>
    </div>
  )
}
