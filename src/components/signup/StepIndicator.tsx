import { Check } from "lucide-react";

type Props = {
  steps: string[];
  current: number;
};

export default function StepIndicator({ steps, current }: Props) {
  return (
    <div className="border-b border-gray-100 px-6 py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all"
                style={{
                  background: i < current ? "#4F4EA5" : i === current ? "#7F56D9" : "#EAECF0",
                  color: i <= current ? "#fff" : "#667085",
                }}
              >
                {i < current ? <Check size={13} /> : i + 1}
              </div>
              <span
                className="text-xs font-semibold hidden sm:block truncate"
                style={{
                  color: i === current ? "#4F4EA5" : i < current ? "#667085" : "#98A2B3",
                  fontFamily: "var(--font-montserrat)",
                }}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-2 rounded transition-all"
                style={{ background: i < current ? "#4F4EA5" : "#EAECF0" }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
