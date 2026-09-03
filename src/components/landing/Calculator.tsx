"use client";
import { useState } from "react";
import Link from "next/link";

const SUB_YEAR = 180; // $15/mo

function Slider({ label, value, setValue, min, max, prefix = "", suffix = "" }: {
  label: string; value: number; setValue: (v: number) => void;
  min: number; max: number; prefix?: string; suffix?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="slider-row">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 14, color: "var(--muted)" }}>{label}</span>
        <span style={{ fontFamily: "var(--font-inter-tight), 'Inter Tight', sans-serif", fontWeight: 600, fontSize: 18, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>
          {prefix}{value}{suffix}
        </span>
      </div>
      <div className="slider-track" style={{ "--pct": `${pct}%` } as React.CSSProperties}>
        <input type="range" aria-label={label} min={min} max={max} value={value} onChange={(e) => setValue(Number(e.target.value))} />
      </div>
    </div>
  );
}

export default function Calculator() {
  const [internet, setInternet] = useState(105);
  const [mobile, setMobile] = useState(85);
  const [tv, setTv] = useState(40);

  const monthlyBill = internet + mobile + tv;
  const monthlySavings = Math.round(monthlyBill * 0.32);
  const annualSavings = monthlySavings * 12;
  const youKeep = Math.max(annualSavings - SUB_YEAR, 0);
  const multiple = annualSavings > 0 ? (annualSavings / SUB_YEAR).toFixed(1) : "0";

  return (
    <section className="calc">
      <div className="container calc-grid">
        <div>
          <div className="kicker">Find your number</div>
          <h2 className="section-h">How much is the loyalty tax costing you?</h2>
          <p className="section-sub">
            Drag the sliders. This is an estimate of what a retention offer typically knocks off similar Canadian plans — and since we keep 0%, it&apos;s all yours minus the $15/mo.
          </p>
          <div className="calc-controls">
            <Slider label="Internet bill" value={internet} setValue={setInternet} min={40} max={250} prefix="$" suffix="/mo" />
            <Slider label="Mobile (all lines)" value={mobile} setValue={setMobile} min={30} max={400} prefix="$" suffix="/mo" />
            <Slider label="TV / cable" value={tv} setValue={setTv} min={0} max={200} prefix="$" suffix="/mo" />
          </div>
        </div>

        <div className="calc-result">
          <div className="calc-result-inner">
            <div className="kicker-light">Estimated savings, year one</div>
            <div className="calc-big">${annualSavings.toLocaleString()}</div>
            <div className="calc-sub">≈ ${monthlySavings}/month off your bills · {multiple}× what Slash costs</div>

            <div className="calc-bar-wrap">
              <div className="calc-bar">
                <div className="calc-bar-keep" style={{ flex: Math.max(youKeep, 1) }}>
                  <span>You keep</span>
                  <strong>${youKeep.toLocaleString()}</strong>
                </div>
                <div className="calc-bar-fee" style={{ flex: SUB_YEAR }}>
                  <span>Slash</span>
                  <strong>${SUB_YEAR}</strong>
                </div>
              </div>
            </div>

            <Link href="/sign-up" className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }}>
              Keep ${youKeep.toLocaleString()} this year <span aria-hidden>→</span>
            </Link>
            <div className="calc-fine">
              Estimate based on a typical ~32% retention-offer reduction. Not a guarantee. If Slash isn&apos;t for you, full refund in your first 30 days.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
