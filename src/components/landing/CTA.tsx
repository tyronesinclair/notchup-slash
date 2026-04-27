import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-20" style={{ background: "linear-gradient(135deg, #4F4EA5 0%, #7F56D9 100%)" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4"
          style={{ fontFamily: "var(--font-montserrat)" }}>
          Ready to stop overpaying?
        </h2>
        <p className="text-white/75 text-lg mb-8 max-w-xl mx-auto">
          Join thousands of Canadians who are fighting back against Rogers, Bell, and Telus overcharges.
        </p>
        <Link
          href="/sign-up"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base text-notch-purple bg-white shadow-lg hover:bg-gray-50 transition-all hover:-translate-y-0.5"
          style={{ fontFamily: "var(--font-montserrat)", color: "#4F4EA5" }}
        >
          Slash My Bills for $35 →
        </Link>
        <div className="flex items-center justify-center gap-2 mt-5 text-white/60 text-xs">
          <ShieldCheck size={14} />
          <span>Free if we can't save you $100+/year · Money back if you reject</span>
        </div>
      </div>
    </section>
  );
}
