import Link from "next/link";
import { Zap, ShieldCheck, DollarSign } from "lucide-react";

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #4F4EA5 0%, #7F56D9 60%, #9B72EF 100%)" }}
    >
      {/* Background decorative circle */}
      <div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #FC0A7E 0%, transparent 70%)" }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 text-white border border-white/30"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}>
          <Zap size={12} className="fill-yellow-300 text-yellow-300" />
          Exclusively for NotchUp Members · Canada Only
        </div>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          Stop Overpaying on<br className="hidden sm:block" />{" "}
          Rogers, Bell & Telus
        </h1>

        <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
          Our AI agents negotiate better rates on your internet and cell phone bills.
          You approve the savings — or you pay nothing.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link
            href="/sign-up"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base text-notch-purple bg-white hover:bg-gray-50 shadow-lg transition-all hover:-translate-y-0.5"
            style={{ fontFamily: "var(--font-montserrat)", color: "#4F4EA5" }}
          >
            Slash My Bills for $35 →
          </Link>
          <a
            href="#how-it-works"
            className="text-white/80 text-sm font-medium hover:text-white underline underline-offset-4 transition-colors"
          >
            See how it works
          </a>
        </div>

        {/* Trust pills */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {[
            { icon: <ShieldCheck size={14} />, text: "Free if we can't save you $100+/year" },
            { icon: <DollarSign size={14} />, text: "Money back if you reject the offer" },
            { icon: <Zap size={14} />, text: "AI-powered negotiation" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-white/75 text-xs font-medium">
              {icon}
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-t border-white/10" style={{ background: "rgba(0,0,0,0.2)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-center gap-8 md:gap-16 text-center">
          {[
            { value: "35,000+", label: "NotchUp members" },
            { value: "$450", label: "Avg. annual savings" },
            { value: "6 months", label: "To find you savings" },
            { value: "40%", label: "Of savings we keep" },
          ].map(({ value, label }) => (
            <div key={label} className="text-white">
              <div className="text-xl font-extrabold" style={{ fontFamily: "var(--font-montserrat)" }}>{value}</div>
              <div className="text-xs text-white/60 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
