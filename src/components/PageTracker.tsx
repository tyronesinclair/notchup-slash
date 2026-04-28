"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PageTracker({ event, meta }: { event: string; meta?: Record<string, unknown> }) {
  const pathname = usePathname();

  useEffect(() => {
    const base =
      typeof window !== "undefined" ? window.location.pathname.replace(pathname, "") : "";
    fetch(`${base}/api/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, meta }),
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
