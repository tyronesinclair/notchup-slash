"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Menu } from "lucide-react";

const NAV_LINKS = [
  { href: "/#how", label: "How it works" },
  { href: "/#proof", label: "Members" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export default function Nav({ hideSignUpCta }: { hideSignUpCta?: boolean } = {}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        backdropFilter: "saturate(140%) blur(14px)",
        background: scrolled || open ? "color-mix(in oklab, var(--bg) 95%, transparent)" : "transparent",
        borderBottom: scrolled || open ? "1px solid var(--line)" : "1px solid transparent",
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
            {NAV_LINKS.map(l => <a key={l.href} href={l.href}>{l.label}</a>)}
          </nav>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <a href="https://notchup.app" className="nav-sign-in">Sign in</a>
            {!hideSignUpCta && <Link href="/sign-up" className="btn btn-primary btn-sm nav-cta-desktop">Slash my bills <span aria-hidden>→</span></Link>}
            {!hideSignUpCta && <Link href="/sign-up" className="btn btn-primary btn-sm nav-cta-mobile">$35 →</Link>}
            <button
              className="nav-hamburger"
              onClick={() => setOpen(o => !o)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="nav-drawer" onClick={close}>
          <nav className="nav-drawer-inner" onClick={e => e.stopPropagation()}>
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href} className="nav-drawer-link" onClick={close}>
                {l.label}
              </a>
            ))}
            <div className="nav-drawer-footer">
              <a href="https://notchup.app" className="nav-drawer-signin" onClick={close}>Sign in</a>
              {!hideSignUpCta && (
                <Link href="/sign-up" className="btn btn-primary" style={{ justifyContent: "center" }} onClick={close}>
                  Slash my bills — $35 →
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
