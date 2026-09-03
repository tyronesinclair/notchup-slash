"use client";
import { useSyncExternalStore } from "react";
import { HERO_VARIANTS, getVariant, type Variant } from "@/lib/experiment";

const serif = { fontFamily: "var(--font-instrument-serif), 'Instrument Serif', serif", fontStyle: "italic" as const, fontWeight: 400 };

// The hero headline + lede are the A/B surface. Server-renders the control (a) so the
// H1 Google indexes is stable; on the client it swaps to the visitor's assigned variant.
// useSyncExternalStore avoids both a hydration mismatch and a setState-in-effect.
const subscribe = () => () => {};
export default function HeroHeadline() {
  const v = useSyncExternalStore<Variant>(subscribe, () => getVariant(true) ?? "a", () => "a");
  const h = HERO_VARIANTS[v];
  return (
    <>
      <h1 className="hero-h1" data-variant={v}>
        {h.lead}{" "}
        <span className="hero-strike-wrap">
          {h.struck}
          <svg className="hero-strike" viewBox="0 0 400 24" preserveAspectRatio="none" aria-hidden="true">
            <path d="M2,18 Q100,4 200,12 T398,8" stroke="var(--accent)" strokeWidth="10" fill="none" strokeLinecap="round" />
          </svg>
        </span>{" "}
        <em style={{ ...serif, color: "var(--accent-ink)" }}>{h.tail}</em>
      </h1>
      <p className="hero-sub">{h.lede}</p>
    </>
  );
}
