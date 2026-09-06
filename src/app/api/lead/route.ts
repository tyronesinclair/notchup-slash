import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { abandoned, applyOptin, nurture, sendTpl, unsubUrl } from "@/lib/slash-emails";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PUBLIC_BASE = process.env.PUBLIC_BASE_URL ?? "https://notchup.app/slash";
const ABANDON_AFTER_MIN = Number(process.env.SLASH_ABANDON_AFTER_MIN || 30);
const NURTURE_AFTER_DAYS = Number(process.env.SLASH_NURTURE_AFTER_DAYS || 3);
// apply.notchup.app opt-ins ("Show me how" on the post-submit Slash screen) get the
// follow-up a few minutes later instead of the 30-min abandonment (they never started sign-up).
const APPLY_OPTIN_AFTER_MIN = Number(process.env.SLASH_APPLY_OPTIN_AFTER_MIN || 5);

// Very light per-IP throttle (this is a public, unauthenticated write).
const hits = new Map<string, { n: number; t: number }>();
function throttled(ip: string) {
  const now = Date.now(); const h = hits.get(ip);
  if (!h || now - h.t > 60_000) { hits.set(ip, { n: 1, t: now }); return false; }
  h.n += 1; return h.n > 20;
}

// Captured at the name+email step. Schedules the 30-min abandonment email and the day-3
// nurture right away (Resend scheduled sends); /api/submit cancels both on conversion.
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "?";
    if (throttled(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    const b = await req.json();
    const email = String(b.email ?? "").trim().toLowerCase().slice(0, 254);
    const name = String(b.name ?? "").trim().slice(0, 120);
    if (!EMAIL_RE.test(email) || name.length < 2) return NextResponse.json({ error: "Name and a valid email are required" }, { status: 400 });
    const s = (v: unknown, n = 120) => (typeof v === "string" && v ? v.slice(0, n) : null);
    // Opt-ins pushed from the NotchUp loan application ("Show me how" on the post-submit Slash
    // screen). They never started a sign-up, so they get the dedicated follow-up instead of the
    // "you didn't finish" abandonment email, and never the nurture.
    const fromApply = b.source === "apply_optin" || b.source === "apply"
      || b.utm?.utm_medium === "apply-optin" || String(b.utm?.utm_campaign ?? "").includes("optin");
    const attribution = {
      variant: s(b.variant, 8),
      utmSource: s(b.utm?.utm_source) ?? (fromApply ? "apply" : null),
      utmMedium: s(b.utm?.utm_medium) ?? (fromApply ? "apply-optin" : null),
      utmCampaign: s(b.utm?.utm_campaign), utmContent: s(b.utm?.utm_content),
    };

    const existing = await prisma.lead.findUnique({ where: { email } });
    // Already a paying customer? Don't create a lead or schedule anything.
    const paid = await prisma.customer.findFirst({ where: { email, payment: { status: { in: ["paid", "scheduled"] } } }, select: { id: true } });

    const optinStage = fromApply ? { stage: "optin" } : {};
    const lead = await prisma.lead.upsert({
      where: { email },
      update: { name, ...(existing?.convertedAt ? {} : attribution) },
      create: { email, name, ...attribution, ...optinStage },
    });

    // Each lifecycle email is gated separately (SLASH_ABANDON_EMAIL=on / SLASH_NURTURE_EMAIL=on;
    // SLASH_LIFECYCLE_EMAILS=on enables both). Until on, leads are only recorded.
    const master = process.env.SLASH_LIFECYCLE_EMAILS === "on";
    // The apply-funnel follow-up has its own switch so it can go live without the abandonment email.
    const abandonOn = fromApply
      ? (master || process.env.SLASH_APPLY_OPTIN_EMAIL === "on")
      : (master || process.env.SLASH_ABANDON_EMAIL === "on");
    const nurtureOn = master || process.env.SLASH_NURTURE_EMAIL === "on";
    const eligible = !paid && !lead.convertedAt && !lead.unsubscribedAt;
    // The abandon slot holds the apply follow-up for opt-ins (see firstTpl below); nurture is sign-up-only.
    const wantAbandon = abandonOn && eligible && !lead.abandonEmailId && !lead.abandonScheduledAt;
    const wantNurture = nurtureOn && eligible && !fromApply && !lead.nurtureEmailId && !lead.nurtureScheduledAt;
    console.log("lead:", { id: lead.id, fromApply, abandonOn, nurtureOn, eligible, wantAbandon, wantNurture });
    if (wantAbandon || wantNurture) {
      const link = (campaign: string) => `${PUBLIC_BASE}/sign-up?lead=${lead.id}&utm_source=email&utm_medium=lifecycle&utm_campaign=${campaign}`;
      // Apply opt-ins: the "show me how" follow-up ~5 min later (stored in the abandon slot so
      // /api/submit's cancel-on-conversion still covers it). Everyone else: the 30-min abandonment.
      const abandonAt = new Date(Date.now() + (fromApply ? APPLY_OPTIN_AFTER_MIN : ABANDON_AFTER_MIN) * 60e3);
      const nurtureAt = new Date(Date.now() + NURTURE_AFTER_DAYS * 86400e3);
      const unsub = unsubUrl(email);
      const firstTpl = fromApply
        ? applyOptin({ name, email, url: link("slash-apply-optin") })
        : abandoned({ name, email, resumeUrl: link("slash-abandon") });
      const results = await Promise.allSettled([
        wantAbandon ? sendTpl(email, firstTpl, { scheduledAt: abandonAt, tag: fromApply ? "slash-apply-optin" : "slash-abandon", listUnsubscribe: unsub }) : Promise.resolve({ id: null as string | null }),
        wantNurture ? sendTpl(email, nurture({ name, email, url: link("slash-nurture") }), { scheduledAt: nurtureAt, tag: "slash-nurture", listUnsubscribe: unsub }) : Promise.resolve({ id: null as string | null }),
      ]);
      const a = results[0].status === "fulfilled" ? results[0].value.id : null;
      const n = results[1].status === "fulfilled" ? results[1].value.id : null;
      for (const r of results) if (r.status === "rejected") console.error("lead: schedule failed", r.reason);
      await prisma.lead.update({ where: { id: lead.id }, data: {
        ...(a && { abandonEmailId: a, abandonScheduledAt: abandonAt }),
        ...(n && { nurtureEmailId: n, nurtureScheduledAt: nurtureAt }),
      } });
    }
    return NextResponse.json({ id: lead.id });
  } catch (err) {
    console.error("lead error:", err);
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }
}
