"use client";
import { useState } from "react";
import Link from "next/link";

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
        <input
          type="range" min={min} max={max} value={value}
          onChange={(e) => setValue(Number(e.target.value))}
        />
      </div>
    </div>
  );
}

export default function Calculator() {
  const [internet, setInternet] = useState(105);
  const [mobile, setMobile] = useState(85);
  const [households, setHouseholds] = useState(1);

  const monthlyBill = (internet + mobile) * households;
  const monthlySavings = Math.round(monthlyBill * 0.32);
  const annualSavings = monthlySavings * 12;
  const slashCut = Math.round(annualSavings * 0.40);
  const youKeep = annualSavings - slashCut - 35;

  return (
    <section className="calc">
      <div className="container calc-grid">
        <div>
          <div className="kicker">Find your number</div>
          <h2 className="section-h">How much are you leaving on the table?</h2>
          <p className="section-sub">
            Drag the sliders. We&apos;ll show you what we typically save Canadians on similar plans — based on 14,000+ negotiations.
          </p>
          <div className="calc-controls">
            <Slider label="Internet bill" value={internet} setValue={setInternet} min={40} max={250} prefix="$" suffix="/mo" />
            <Slider label="Mobile (combined)" value={mobile} setValue={setMobile} min={30} max={400} prefix="$" suffix="/mo" />
            <Slider label="People in household" value={households} setValue={setHouseholds} min={1} max={5} suffix=" people" />
          </div>
        </div>

        <div className="calc-result">
          <div className="calc-result-inner">
            <div className="kicker-light">Estimated annual savings</div>
            <div className="calc-big">${annualSavings.toLocaleString()}</div>
            <div className="calc-sub">≈ ${monthlySavings}/month off your bills</div>

            <div className="calc-bar-wrap">
              <div className="calc-bar">
                <div className="calc-bar-keep" style={{ flex: Math.max(youKeep, 0) }}>
                  <span>You keep</span>
                  <strong>${Math.max(youKeep, 0).toLocaleString()}</strong>
                </div>
                <div className="calc-bar-cut" style={{ flex: slashCut }}>
                  <span>NotchUp 40%</span>
                  <strong>${slashCut.toLocaleString()}</strong>
                </div>
                <div className="calc-bar-fee" style={{ flex: 35 }}>
                  <span>Fee</span>
                  <strong>$35</strong>
                </div>
              </div>
            </div>

            <Link href="/sign-up" className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }}>
              Lock in ${Math.max(youKeep, 0).toLocaleString()} <span aria-hidden>→</span>
            </Link>
            <div className="calc-fine">
              Estimate based on 32% avg. reduction across approved offers. Not a guarantee.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
