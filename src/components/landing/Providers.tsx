export default function Providers() {
  const providers = ["Rogers", "Bell", "Telus", "Videotron", "Freedom Mobile", "Shaw"];

  return (
    <section className="py-12 bg-gray-50 border-y border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8">
          We negotiate with Canada's biggest providers
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          {providers.map((p) => (
            <div
              key={p}
              className="px-5 py-2.5 bg-white rounded-xl border border-gray-200 shadow-sm text-sm font-bold text-gray-700"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
