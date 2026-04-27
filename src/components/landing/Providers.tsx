const providers = [
  { name: "Rogers", color: "#E4002B" },
  { name: "Bell", color: "#0055A5" },
  { name: "Telus", color: "#4B286D" },
  { name: "Freedom", color: "#FF6900" },
  { name: "Videotron", color: "#00205B" },
  { name: "Shaw", color: "#0072CE" },
];

export default function Providers() {
  return (
    <section className="py-10 bg-gray-50 border-y border-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-7">
          We negotiate with Canada's biggest carriers
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {providers.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: p.color }}
              />
              <span
                className="text-sm font-bold text-gray-700"
                style={{ fontFamily: "var(--font-montserrat)" }}
              >
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
