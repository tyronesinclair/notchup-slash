import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah K.",
    location: "Toronto, ON",
    saving: "$62/month",
    provider: "Rogers Internet",
    quote: "I'd been meaning to call Rogers for over a year but kept putting it off. NotchUp Slash handled everything. Got my bill down from $119 to $57 — without me lifting a finger.",
    initials: "SK",
    color: "#7F56D9",
  },
  {
    name: "Michael T.",
    location: "Calgary, AB",
    saving: "$38/month",
    provider: "Bell Mobility",
    quote: "Was paying $95/month for my cell plan. They got it to $57 with the same data. Paid the $35 fee and got back $152 in the first year after their cut. Absolutely worth it.",
    initials: "MT",
    color: "#4F4EA5",
  },
  {
    name: "Priya N.",
    location: "Vancouver, BC",
    saving: "$44/month",
    provider: "Telus Internet + Cell",
    quote: "Did both my internet and phone plan at the same time. The whole thing took about 4 weeks and I didn't have to do anything after signing up. Super impressed.",
    initials: "PN",
    color: "#B32E6E",
  },
];

function Stars() {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={13} className="fill-yellow-400 text-yellow-400" />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span
            className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full mb-4"
            style={{ background: "#F4EBFF", color: "#6941C6" }}
          >
            Member Stories
          </span>
          <h2
            className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            Real savings for real Canadians
          </h2>
          <p className="text-gray-500 text-sm">
            These are NotchUp members who used Slash in our early access round.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col gap-4"
            >
              {/* Stars */}
              <Stars />

              {/* Quote */}
              <p className="text-sm text-gray-700 leading-relaxed flex-1">
                "{t.quote}"
              </p>

              {/* Saving badge */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white self-start"
                style={{ background: t.color }}
              >
                <span>Saving {t.saving}</span>
                <span className="opacity-75">· {t.provider}</span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-1 border-t border-gray-200">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold text-white shrink-0"
                  style={{ background: t.color }}
                >
                  {t.initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900" style={{ fontFamily: "var(--font-montserrat)" }}>
                    {t.name}
                  </div>
                  <div className="text-xs text-gray-400">{t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust bar */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
          <span>⭐ 4.9/5 from early access members</span>
          <span className="hidden sm:block">·</span>
          <span>🇨🇦 Canada-only service</span>
          <span className="hidden sm:block">·</span>
          <span>🔒 Bank-grade credential security</span>
        </div>
      </div>
    </section>
  );
}
