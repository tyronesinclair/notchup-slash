import { ClipboardList, Bot, ThumbsUp, Banknote } from "lucide-react";

const steps = [
  {
    icon: <ClipboardList size={24} />,
    title: "Tell us your providers",
    desc: "Select your internet and cell phone providers, share your account credentials, and pay the $35 activation fee. Takes about 5 minutes.",
    time: "5 min",
  },
  {
    icon: <Bot size={24} />,
    title: "Our AI gets to work",
    desc: "Our AI agents analyse your bills, identify overpayments, and negotiate directly with Rogers, Bell, or Telus on your behalf.",
    time: "3–5 weeks",
  },
  {
    icon: <ThumbsUp size={24} />,
    title: "You review the savings",
    desc: "We email you a savings proposal. Review every detail — you're in full control. Reject it for any reason and get your $35 back.",
    time: "Your call",
  },
  {
    icon: <Banknote size={24} />,
    title: "Keep the savings",
    desc: "Approve the new rate, we take 40% of the first year's savings, and you enjoy lower bills for years to come.",
    time: "Forever",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full mb-4"
            style={{ background: "#F4EBFF", color: "#6941C6" }}>
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4"
            style={{ fontFamily: "var(--font-montserrat)" }}>
            We do the fighting.<br />You keep the savings.
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            No hold times. No awkward conversations with retention agents. Just better rates.
          </p>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-notch-100 via-notch-200 to-notch-100 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, i) => (
              <div key={step.title} className="flex flex-col items-center text-center">
                {/* Icon circle */}
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 shadow-md text-white"
                  style={{ background: "linear-gradient(135deg, #7F56D9, #4F4EA5)" }}
                >
                  {step.icon}
                </div>

                {/* Step number */}
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                  Step {i + 1} · {step.time}
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-2"
                  style={{ fontFamily: "var(--font-montserrat)" }}>
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
