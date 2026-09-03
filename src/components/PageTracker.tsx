"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getVariant, getAttribution } from "@/lib/experiment";

// Fires one analytics event on mount, tagged with the visitor's A/B variant and
// first-touch UTMs. `assignVariant` is true ONLY on the landing page (the hero test).
export default function PageTracker({ event, meta, assignVariant }: { event: string; meta?: Record<string, unknown>; assignVariant?: boolean }) {
  const pathname = usePathname();

  useEffect(() => {
    const base = typeof window !== "undefined" ? window.location.pathname.replace(pathname, "") : "";
    const variant = getVariant(!!assignVariant);
    const attribution = getAttribution();
    fetch(`${base}/api/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, meta: { ...(meta ?? {}), variant, ...attribution } }),
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
