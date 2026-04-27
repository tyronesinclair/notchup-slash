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
        <Link href="/" className="flex items-center gap-2">
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
            className="text-sm font-bold px-5 py-2.5 rounded-lg text-white transition-all hover:opacity-90"
            style={{ background: "#4F4EA5", fontFamily: "var(--font-montserrat)" }}
          >
            Slash My Bills →
          </Link>
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-4">
          <a href="#how-it-works" className="text-sm font-medium text-gray-700" onClick={() => setOpen(false)}>How it works</a>
          <a href="#pricing" className="text-sm font-medium text-gray-700" onClick={() => setOpen(false)}>Pricing</a>
          <a href="#faq" className="text-sm font-medium text-gray-700" onClick={() => setOpen(false)}>FAQ</a>
          <Link
            href="/sign-up"
            className="text-sm font-bold px-5 py-3 rounded-lg text-white text-center"
            style={{ background: "#4F4EA5" }}
            onClick={() => setOpen(false)}
          >
            Slash My Bills →
          </Link>
        </div>
      )}
    </nav>
  );
}
