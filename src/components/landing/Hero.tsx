import Link from "next/link";
import { Zap, ShieldCheck, DollarSign } from "lucide-react";

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #4F4EA5 0%, #7F56D9 60%, #9B72EF 100%)" }}
    >
      {/* Decorative blobs */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #FC0A7E 0%, transparent 70%)" }} />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">

        {/* Social proof hook */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-5 text-white border border-white/30"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}>
          <Zap size={11} className="fill-yellow-300 text-yellow-300" />
          Exclusively for NotchUp Members · Canada Only
        </div>

        {/* Kicker stat */}
        <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-4">
          The average Canadian overpays by <span className="text-white font-extrabold">$487/year</span> on their phone & internet
        </p>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.1] mb-5"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          Stop Overpaying on<br />
          Rogers, Bell & Telus
        </h1>

        <p className="text-base sm:text-lg text-white/80 max-w-xl mx-auto mb-8 leading-relaxed">
          Our AI negotiates better rates on your bills in 3–5 weeks.
          You approve the savings — or you pay <span className="text-white font-semibold">nothing</span>.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <Link
            href="/sign-up"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-extrabold text-base shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
            style={{ fontFamily: "var(--font-montserrat)", background: "#fff", color: "#4F4EA5" }}
          >
            Slash My Bills for $35 →
          </Link>
          <a
            href="#how-it-works"
            className="text-white/70 text-sm font-medium hover:text-white underline underline-offset-4 transition-colors"
          >
            See how it works
          </a>
        </div>

        {/* Trust pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
          {[
            { icon: <ShieldCheck size={13} />, text: "Free if we can't save $100+/year" },
            { icon: <DollarSign size={13} />, text: "$35 back if you reject our offer" },
            { icon: <Zap size={13} />, text: "AI-powered · No hold times" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-white/70 text-xs font-medium">
              {icon}
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats bar — 2×2 on mobile, 4 across on desktop */}
      <div className="border-t border-white/10" style={{ background: "rgba(0,0,0,0.25)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { value: "35,000+", label: "NotchUp members" },
            { value: "$450", label: "Avg. annual savings" },
            { value: "3–5 wks", label: "Typical turnaround" },
            { value: "40%", label: "Of savings only" },
          ].map(({ value, label }) => (
            <div key={label} className="text-white py-1">
              <div className="text-xl sm:text-2xl font-extrabold" style={{ fontFamily: "var(--font-montserrat)" }}>{value}</div>
              <div className="text-xs text-white/55 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
