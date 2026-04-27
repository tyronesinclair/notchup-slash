import Link from "next/link";
import { Check, ShieldCheck, X } from "lucide-react";

export default function Pricing() {
  return (
    <section id="pricing" className="py-20" style={{ background: "#F9F5FF" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full mb-4"
            style={{ background: "#F4EBFF", color: "#6941C6" }}>
            Pricing & Guarantee
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4"
            style={{ fontFamily: "var(--font-montserrat)" }}>
            Pay less than a coffee.<br />Save hundreds a year.
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Simple, transparent pricing. We only win when you win.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* $35 card */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <div className="text-3xl font-extrabold text-gray-900 mb-1"
              style={{ fontFamily: "var(--font-montserrat)" }}>
              $35
            </div>
            <div className="text-sm text-gray-500 mb-6">one-time activation fee</div>
            <ul className="space-y-3 text-sm text-gray-600">
              {[
                "Covers AI agent setup",
                "Covers bill analysis",
                "Covers negotiation effort",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Main card */}
          <div className="rounded-2xl p-8 text-white shadow-xl relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #4F4EA5 0%, #7F56D9 100%)" }}>
            <div className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.2)" }}>
              Most Popular
            </div>
            <div className="text-3xl font-extrabold mb-1"
              style={{ fontFamily: "var(--font-montserrat)" }}>
              40%
            </div>
            <div className="text-sm text-white/70 mb-6">of annual savings we secure</div>
            <ul className="space-y-3 text-sm text-white/80">
              {[
                "Only charged after you approve",
                "Based on first year's savings",
                "You keep 60% forever",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check size={16} className="text-green-300 mt-0.5 shrink-0" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Guarantee card */}
          <div className="bg-white rounded-2xl p-8 border-2 border-green-200 shadow-sm"
            style={{ background: "#ECFDF3" }}>
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-4">
              <ShieldCheck size={20} className="text-green-600" />
            </div>
            <div className="text-lg font-extrabold text-gray-900 mb-2"
              style={{ fontFamily: "var(--font-montserrat)" }}>
              Risk-Free Guarantee
            </div>
            <ul className="space-y-3 text-sm text-gray-600">
              {[
                { icon: true, text: "Can't save $100+/year? It's completely free" },
                { icon: true, text: "Don't like our offer? $35 fully refunded" },
                { icon: true, text: "6-month window to find savings" },
              ].map(({ text }) => (
                <li key={text} className="flex items-start gap-2">
                  <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Example savings */}
        <div className="mt-10 max-w-4xl mx-auto bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <p className="text-center text-sm font-bold text-gray-700 mb-4"
            style={{ fontFamily: "var(--font-montserrat)" }}>
            Example Savings Scenario
          </p>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-2xl font-extrabold text-gray-900"
                style={{ fontFamily: "var(--font-montserrat)" }}>
                $50/mo
              </div>
              <div className="text-gray-500 text-xs">Savings found on Rogers</div>
            </div>
            <div className="border-x border-gray-200">
              <div className="text-2xl font-extrabold" style={{ color: "#B32E6E", fontFamily: "var(--font-montserrat)" }}>
                $600/yr
              </div>
              <div className="text-gray-500 text-xs">Annual savings</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-green-600"
                style={{ fontFamily: "var(--font-montserrat)" }}>
                $325
              </div>
              <div className="text-gray-500 text-xs">You keep (after $35 + 40%)</div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base text-white shadow-lg hover:opacity-90 transition-all hover:-translate-y-0.5"
            style={{ background: "#4F4EA5", fontFamily: "var(--font-montserrat)" }}
          >
            Start for $35 →
          </Link>
          <p className="text-xs text-gray-400 mt-3">Money back if you reject our savings proposal</p>
        </div>
      </div>
    </section>
  );
}
