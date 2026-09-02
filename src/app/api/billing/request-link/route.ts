import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { manageUrl } from "@/lib/stripe";
import { sendManageLinkEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Light in-memory rate limit (per container) so this can't be used to spam an inbox.
const hits = new Map<string, number[]>();
function limited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= max) { hits.set(key, arr); return true; }
  arr.push(now); hits.set(key, arr); return false;
}

// Emails the subscriber their tokenized billing-portal link. Always responds 200 with
// the same body so the endpoint can't be used to check whether an email is subscribed.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 254);
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }
  if (limited(email, 3, 3600e3)) return NextResponse.json({ ok: true });

  const customer = await prisma.customer.findUnique({ where: { email } });
  if (customer?.stripeCustomerId) {
    sendManageLinkEmail(email, manageUrl(email)).catch((e) => console.error("manage-link email failed:", e));
  }
  return NextResponse.json({ ok: true });
}
