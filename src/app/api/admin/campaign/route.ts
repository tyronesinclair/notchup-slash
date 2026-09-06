import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { stripe, ensurePrice, manageUrl } from "@/lib/stripe";
import { abandoned, nurture, winback, paydayReminder, sendTpl, unsubUrl, type Tpl } from "@/lib/slash-emails";

const PUBLIC_BASE = process.env.PUBLIC_BASE_URL ?? "https://notchup.app/slash";

function render(template: string, p: { name: string; email: string }): Tpl {
  const url = (c: string) => `${PUBLIC_BASE}?utm_source=email&utm_medium=lifecycle&utm_campaign=${c}`;
  switch (template) {
    case "abandoned": return abandoned({ name: p.name, email: p.email, resumeUrl: `${PUBLIC_BASE}/sign-up?utm_source=email&utm_medium=lifecycle&utm_campaign=slash-abandon` });
    case "nurture": return nurture({ name: p.name, email: p.email, url: url("slash-nurture") });
    case "winback": return winback({ name: p.name, email: p.email, url: url("slash-winback") });
    case "paydayReminder": return paydayReminder({ name: p.name, payday: new Date(Date.now() + 3 * 86400e3).toISOString().slice(0, 10), manageUrl: manageUrl(p.email) });
    default: throw new Error("unknown template");
  }
}

// Win-back audience: people who reached checkout (a Stripe customer + Slash subscription
// exists) but never got a card saved or paid, and aren't customers/leads who opted out.
async function stalledAudience() {
  const price = await ensurePrice();
  const since = Math.floor(new Date("2026-09-02T00:00:00Z").getTime() / 1000);
  const byEmail = new Map<string, { name: string; email: string; statuses: Set<string> }>();
  for await (const s of stripe.subscriptions.list({ price, created: { gte: since }, status: "all", limit: 100, expand: ["data.customer"] })) {
    const c = s.customer as { email?: string | null; name?: string | null; deleted?: boolean };
    if (!c?.email || c.deleted) continue;
    const email = c.email.toLowerCase();
    const row = byEmail.get(email) ?? { name: c.name ?? s.metadata?.name ?? "", email, statuses: new Set<string>() };
    row.statuses.add(s.status); if (!row.name && s.metadata?.name) row.name = s.metadata.name;
    byEmail.set(email, row);
  }
  const emails = [...byEmail.keys()];
  const [paid, optedOut] = await Promise.all([
    prisma.customer.findMany({ where: { email: { in: emails }, payment: { status: { in: ["paid", "scheduled"] } } }, select: { email: true } }),
    prisma.lead.findMany({ where: { email: { in: emails }, OR: [{ unsubscribedAt: { not: null } }, { convertedAt: { not: null } }] }, select: { email: true } }),
  ]);
  const skip = new Set([...paid, ...optedOut].map((x) => x.email.toLowerCase()));
  return [...byEmail.values()].filter((r) => !r.statuses.has("active") && !r.statuses.has("trialing") && !r.statuses.has("past_due") && !skip.has(r.email) && !r.email.includes("notchup-slash-test"));
}

export async function POST(req: NextRequest) {
  const token = (await cookies()).get("admin_token")?.value;
  if (!token || token !== process.env.ADMIN_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return await handle(await req.json());
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("campaign error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function handle(b: { template?: string; to?: string; email?: string; name?: string; dryRun?: boolean }) {
  const template = String(b.template ?? "");

  if (b.to === "test") {
    const email = String(b.email ?? "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return NextResponse.json({ error: "email required" }, { status: 400 });
    const tpl = render(template, { name: String(b.name ?? "Ty"), email });
    const { id } = await sendTpl(email, tpl, { tag: `draft-${template}`, listUnsubscribe: unsubUrl(email) });
    return NextResponse.json({ sent: 1, id, subject: tpl.subject });
  }

  if (b.to === "stalled") {
    const audience = await stalledAudience();
    if (b.dryRun !== false) return NextResponse.json({ dryRun: true, count: audience.length, audience: audience.map((a) => ({ name: a.name, email: a.email })) });
    if (template !== "winback") return NextResponse.json({ error: "only winback goes to the stalled list" }, { status: 400 });
    const results: { email: string; id: string | null; error?: string }[] = [];
    for (const a of audience) {
      try {
        const tpl = render("winback", { name: a.name, email: a.email });
        const { id } = await sendTpl(a.email, tpl, { tag: "slash-winback", listUnsubscribe: unsubUrl(a.email) });
        results.push({ email: a.email, id });
      } catch (e) { results.push({ email: a.email, id: null, error: (e as Error).message }); }
    }
    return NextResponse.json({ sent: results.filter((r) => r.id).length, results });
  }
  return NextResponse.json({ error: "to must be 'test' or 'stalled'" }, { status: 400 });
}
