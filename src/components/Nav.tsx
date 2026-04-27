"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 shrink-0" onClick={() => setOpen(false)}>
          <span
            className="text-xl font-extrabold tracking-tight"
            style={{ fontFamily: "var(--font-montserrat)", color: "#4F4EA5" }}
          >
            NotchUp
          </span>
          <span
            className="text-xl font-extrabold tracking-tight px-2 py-0.5 rounded"
            style={{ background: "#4F4EA5", color: "#fff", fontFamily: "var(--font-montserrat)" }}
          >
            Slash
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-notch-purple transition-colors">
            How it works
          </a>
          <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-notch-purple transition-colors">
            Pricing
          </a>
          <a href="#faq" className="text-sm font-medium text-gray-600 hover:text-notch-purple transition-colors">
            FAQ
          </a>
          <Link
            href="/sign-up"
            className="text-sm font-bold px-5 py-2.5 rounded-lg text-white transition-all hover:opacity-90 hover:shadow-md"
            style={{ background: "#4F4EA5", fontFamily: "var(--font-montserrat)" }}
          >
            Slash My Bills →
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-1 shadow-lg">
          {[
            { href: "#how-it-works", label: "How it works" },
            { href: "#pricing", label: "Pricing" },
            { href: "#faq", label: "FAQ" },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
          <div className="pt-2 border-t border-gray-100 mt-1">
            <Link
              href="/sign-up"
              className="block text-sm font-bold px-4 py-3.5 rounded-xl text-white text-center transition-all hover:opacity-90"
              style={{ background: "#4F4EA5", fontFamily: "var(--font-montserrat)" }}
              onClick={() => setOpen(false)}
            >
              Slash My Bills for $35 →
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
