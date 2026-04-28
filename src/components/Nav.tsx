"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      backdropFilter: "saturate(140%) blur(14px)",
      background: scrolled ? "color-mix(in oklab, var(--bg) 78%, transparent)" : "transparent",
      borderBottom: scrolled ? "1px solid var(--line)" : "1px solid transparent",
      transition: "all .25s ease",
    }}>
      <div className="container nav-row">
        <a href="https://notchup.app" style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--ink)", textDecoration: "none" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://cdn.prod.website-files.com/663d33e48a497e68ec23fc06/66427492c358294cac47f56b_NU%201B.png"
            alt="NotchUp"
            style={{ height: 22, width: "auto", display: "block" }}
          />
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            paddingLeft: 12, borderLeft: "1px solid var(--line-strong)",
            fontFamily: "var(--font-inter-tight), 'Inter Tight', sans-serif",
            fontWeight: 500, fontSize: 15, letterSpacing: "-0.01em",
            color: "var(--muted)",
          }}>
            <span style={{ color: "var(--accent-ink)", fontWeight: 700 }}>/</span>
            <span>Slash</span>
          </span>
        </a>

        <nav className="nav-links nav-links-desktop">
          <a href="#how">How it works</a>
          <a href="#proof">Members</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </nav>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <a href="https://notchup.app" className="nav-sign-in">Sign in</a>
          <Link href="/sign-up" className="btn btn-primary btn-sm nav-cta-desktop">Slash my bills <span aria-hidden>→</span></Link>
          <Link href="/sign-up" className="btn btn-primary btn-sm nav-cta-mobile">$35 →</Link>
        </div>
      </div>
    </header>
  );
}
