import Link from "next/link";
import { ShieldCheck, Clock } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-20" style={{ background: "linear-gradient(135deg, #4F4EA5 0%, #7F56D9 100%)" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mb-6 text-amber-900 bg-amber-100 border border-amber-200">
          <Clock size={12} />
          3–5 week queue — spots filling fast
        </div>

        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4"
          style={{ fontFamily: "var(--font-montserrat)" }}>
          Ready to stop overpaying?
        </h2>
        <p className="text-white/75 text-base mb-8 max-w-lg mx-auto">
          Canadians with Rogers, Bell, and Telus are overpaying by hundreds per year.
          It takes 5 minutes to start. We handle the rest.
        </p>

        <Link
          href="/sign-up"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-extrabold text-base shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all"
          style={{ fontFamily: "var(--font-montserrat)", background: "#fff", color: "#4F4EA5" }}
        >
          Slash My Bills for $35 →
        </Link>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-white/55 text-xs">
          <span className="flex items-center gap-1.5"><ShieldCheck size={13} />Free if we can't save $100+/year</span>
          <span className="flex items-center gap-1.5"><ShieldCheck size={13} />$35 back if you reject our offer</span>
        </div>
      </div>
    </section>
  );
}
