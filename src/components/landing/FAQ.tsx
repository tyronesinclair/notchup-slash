"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How does NotchUp Slash work?",
    a: "You sign up, select your providers (Rogers, Bell, Telus, etc.), and share your account credentials securely. Our AI agents analyse your bills, identify where you're overpaying, and negotiate better rates directly with the providers on your behalf. When we find savings, we send you a proposal to approve. You're always in control.",
  },
  {
    q: "Is my login information safe?",
    a: "Your credentials are encrypted with AES-256-GCM encryption — the same standard used by banks — before being stored. They are only decrypted by our AI agents to perform negotiations, and are never shared with third parties. We treat your data with the same care we'd want for our own.",
  },
  {
    q: "What if you can't save me money?",
    a: "If we can't find you savings of at least $100 per year within 6 months, you owe us nothing — your $35 activation fee is fully refunded. No questions asked.",
  },
  {
    q: "What if I don't like the savings offer?",
    a: "You're never obligated to accept. If you review our savings proposal and decide to pass, we refund your $35. Simple as that.",
  },
  {
    q: "How long does the process take?",
    a: "Typically 3–5 weeks. Our AI agents work through a queue of negotiations, and providers often have internal processes that take time. You'll receive an email the moment we begin working on your file, and another when we have a savings proposal ready.",
  },
  {
    q: "Which providers and services do you negotiate?",
    a: "Currently we negotiate internet and cell phone bills with Rogers, Bell, Telus, Videotron, Freedom Mobile, and Shaw. We're adding more providers and services (TV, home phone) soon.",
  },
  {
    q: "Can I add multiple providers or services?",
    a: "Absolutely. You can add as many services as you want during sign-up — internet with Rogers, cell with Bell, etc. Each service gets its own negotiation track. One $35 activation fee covers all of them.",
  },
  {
    q: "Is this service available across Canada?",
    a: "Yes — NotchUp Slash is available to Canadian residents in all provinces. We focus on the major national and regional carriers, so most Canadians are covered.",
  },
  {
    q: "What's the 40% commission based on?",
    a: "The 40% is calculated on your first year of annual savings. For example, if we reduce your Rogers bill by $50/month, that's $600 in annual savings. We take $240 (40%), and you keep $360 — every single year after that for free.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full mb-4"
            style={{ background: "#F4EBFF", color: "#6941C6" }}>
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900"
            style={{ fontFamily: "var(--font-montserrat)" }}>
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border overflow-hidden transition-all"
              style={{ borderColor: open === i ? "#D6BBFB" : "#EAECF0" }}
            >
              <button
                className="w-full flex items-center justify-between px-6 py-4 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-semibold text-gray-900 text-sm" style={{ fontFamily: "var(--font-montserrat)" }}>
                  {faq.q}
                </span>
                <ChevronDown
                  size={18}
                  className="shrink-0 text-gray-400 transition-transform"
                  style={{ transform: open === i ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                  <div className="pt-4">{faq.a}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
