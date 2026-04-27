"use client";
import { useState, useEffect } from "react";

function ReceiptLine({ label, value, accent, muted }: { label: string; value: string; accent?: boolean; muted?: boolean }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between",
      fontSize: 14,
      fontFamily: "var(--font-inter-tight), 'Inter Tight', sans-serif",
      transition: "all .4s ease",
      color: accent ? "var(--accent-ink)" : (muted ? "var(--muted)" : "var(--ink)"),
      fontWeight: accent ? 600 : 400,
    }}>
      <span>{label}</span>
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

export default function BillReceipt() {
  const [stage, setStage] = useState(0); // 0 idle, 1 negotiating, 2 done
  const oldPrice = 119.00;
  const newPrice = 57.00;
  const [displayed, setDisplayed] = useState(oldPrice);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 1500);
    const t2 = setTimeout(() => setStage(2), 5200);
    const loop = setInterval(() => {
      setStage(0);
      setTimeout(() => setStage(1), 1500);
      setTimeout(() => setStage(2), 5200);
    }, 9000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearInterval(loop); };
  }, []);

  useEffect(() => {
    if (stage === 2) {
      let raf: number;
      const duration = 1200;
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplayed(oldPrice + (newPrice - oldPrice) * eased);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    } else if (stage === 0) {
      setDisplayed(oldPrice);
    }
  }, [stage]);

  return (
    <div className="receipt">
      <div className="receipt-perf" style={{ top: -8 }} />
      <div style={{ padding: "26px 28px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--muted)", textTransform: "uppercase" }}>Rogers · Account #4471</div>
            <div style={{ fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif", fontSize: 26, marginTop: 4, color: "var(--ink)" }}>Internet Ignite 1Gbps</div>
          </div>
          <div style={{
            fontSize: 11, padding: "4px 8px", borderRadius: 6,
            background: stage === 2 ? "var(--accent)" : (stage === 1 ? "oklch(0.95 0.03 80)" : "var(--bg-soft)"),
            color: stage === 2 ? "var(--accent-ink)" : "var(--muted)",
            border: "1px solid " + (stage === 2 ? "transparent" : "var(--line)"),
            fontWeight: 500, letterSpacing: "0.04em",
            transition: "all .3s ease",
            whiteSpace: "nowrap",
          }}>
            {stage === 0 && "BEFORE"}
            {stage === 1 && "NEGOTIATING…"}
            {stage === 2 && "AFTER"}
          </div>
        </div>

        <div style={{ marginTop: 24, display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-inter-tight), 'Inter Tight', sans-serif", fontSize: 56, fontWeight: 500, letterSpacing: "-0.04em", color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>
            ${displayed.toFixed(2)}
          </span>
          <span style={{ color: "var(--muted)", fontSize: 14 }}>/ month</span>
        </div>

        {stage === 2 && (
          <div className="anim-fade-in" style={{ marginTop: 6, fontSize: 13, color: "var(--muted)" }}>
            Was <span style={{ textDecoration: "line-through" }}>$119.00</span> · You save <strong style={{ color: "var(--accent-ink)" }}>$62/mo</strong>
          </div>
        )}

        <div style={{ marginTop: 24, display: "grid", gap: 8 }}>
          <ReceiptLine label="Base plan" value={stage === 2 ? "$54.00" : "$94.00"} muted={stage !== 2} />
          <ReceiptLine label="Loyalty credit" value={stage === 2 ? "−$12.00" : "$0.00"} accent={stage === 2} />
          <ReceiptLine label="Equipment fee" value={stage === 2 ? "WAIVED" : "$15.00"} accent={stage === 2} />
          <ReceiptLine label="Surprise charges" value={stage === 2 ? "GONE" : "$10.00"} accent={stage === 2} />
        </div>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px dashed var(--line)", display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)" }}>
          <span>3–5 weeks · zero phone calls</span>
          <span style={{ fontFamily: "monospace" }}>SLASH-{stage === 2 ? "DONE" : "0042"}</span>
        </div>
      </div>
      <div className="receipt-perf" style={{ bottom: -8 }} />
    </div>
  );
}
