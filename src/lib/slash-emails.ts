// Slash lifecycle + campaign emails (Resend). One shell, calm and branded, mirrors
// NotchUp Shield's server/shield-emails.js. Every template returns {subject, html, text}.
import { Resend } from "resend";
import { createHmac } from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);
export const FROM = process.env.SLASH_FROM || "NotchUp Slash <slash@notchup.app>";
export const REPLY_TO = "help@notchup.app";
const PUBLIC_BASE = process.env.PUBLIC_BASE_URL ?? "https://notchup.app/slash";
const LOGO = "https://cdn.prod.website-files.com/663d33e48a497e68ec23fc06/66427492c358294cac47f56b_NU%201B.png";

export const firstName = (name?: string | null) => (String(name ?? "").trim().split(/\s+/)[0] || "there");
// "Ty, …" opens better than a bare subject; falls back cleanly when we have no name.
const realFirst = (name?: string | null) => { const f = String(name ?? "").trim().split(/\s+/)[0]; return f && f.length <= 24 ? f.charAt(0).toUpperCase() + f.slice(1) : null; };
// Pass the subject in its after-the-comma form ("you were…", "Canadians save…"); it is
// capitalized when we have no name to lead with.
export const subjectFor = (name: string | null | undefined, subject: string) => { const f = realFirst(name); return f ? `${f}, ${subject}` : subject.charAt(0).toUpperCase() + subject.slice(1); };

// Long-form payday label: "Friday, September 12"
export function paydayLabel(iso: string) {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
}

// ── unsubscribe (CASL) ──
export function unsubToken(email: string) {
  const secret = process.env.BILLING_TOKEN_SECRET || process.env.ADMIN_SECRET || "dev";
  return createHmac("sha256", secret).update("slash-unsub:" + email.trim().toLowerCase()).digest("hex").slice(0, 32);
}
export function unsubUrl(email: string) {
  const e = email.trim().toLowerCase();
  return `${PUBLIC_BASE}/api/lead/unsubscribe?e=${encodeURIComponent(e)}&t=${unsubToken(e)}`;
}

// ── shell ──
function shell(inner: string, opts: { reason: string; unsubscribe?: string; preheader?: string }) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;background:#F0F0F5;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;padding:24px 12px;">
${opts.preheader ? `<div style="display:none;font-size:1px;color:#F0F0F5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${opts.preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;"><tr><td>
<img src="${LOGO}" alt="NotchUp" width="118" style="display:block;width:118px;height:auto;border:0;margin:0 0 16px 2px;">
<div style="background:#FFFFFF;border-radius:16px;padding:28px;">${inner}</div>
<p style="margin:16px 0 0;font-size:11px;line-height:1.7;color:#8A8A99;text-align:center;">NotchUp Financial Inc. · 2031 Store St Ste A, Victoria, BC V8T 5L9 · (778) 400-5126<br>${opts.reason}${opts.unsubscribe ? ` · <a href="${opts.unsubscribe}" style="color:#8A8A99;">Unsubscribe</a>` : ""}</p>
</td></tr></table></body></html>`;
}
const P = (s: string, extra = "") => `<p style="margin:0 0 14px;font-size:15.5px;line-height:1.65;color:#17163A;${extra}">${s}</p>`;
const H2 = (s: string) => `<h2 style="margin:0 0 12px;font-size:21px;line-height:1.3;color:#17163A;">${s}</h2>`;
const SMALL = (s: string) => `<p style="margin:0;font-size:13px;line-height:1.6;color:#54539B;">${s}</p>`;
const btn = (href: string, label: string) => `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:18px 0;"><tr><td style="background:#4F4EA5;border-radius:999px;"><a href="${href}" style="display:inline-block;padding:14px 30px;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;">${label}</a></td></tr></table>`;
const dealBox = (rows: string[]) => `<div style="background:#F5F3FD;border-left:4px solid #4425C4;border-radius:0 12px 12px 0;padding:14px 18px;margin:0 0 16px;">${rows.map((r) => `<p style="margin:0 0 6px;font-size:14.5px;line-height:1.55;color:#17163A;">&#10003;&nbsp; ${r}</p>`).join("")}</div>`;
const priceLine = `<p style="margin:0;font-size:13px;line-height:1.6;color:#8A8A99;text-align:center;">$0 today · $15/mo from your next payday · keep 100% of the savings · cancel anytime</p>`;

export type Tpl = { subject: string; html: string; text: string };

// ── 30-minute abandonment (one reminder, Shield-style) ──
export function abandoned(p: { name?: string | null; email: string; resumeUrl: string }): Tpl {
  const fn = firstName(p.name);
  return {
    subject: subjectFor(p.name, "you were one step from done — $0 today"),
    html: shell(`
      ${H2("You were one step from done.")}
      ${P(`Hi ${fn}, you started setting up Slash a little while ago and didn't finish. No charge was made, and everything you entered is saved.`)}
      ${P("Finishing takes about two minutes, and here's how paying works now:")}
      ${dealBox([
        "<strong>$0 today.</strong> Your first $15 comes out on your next payday — you pick the date.",
        "<strong>Keep 100%</strong> of every dollar Slash wins off your bills. We take $0.",
        "Change your mind before payday? Cancel from your billing link and you're never charged.",
      ])}
      ${btn(p.resumeUrl, "Finish setting up Slash")}
      ${priceLine}
      <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#54539B;">This is the only reminder we'll send. Questions? Just reply — a real person answers.</p>`,
      { reason: "You're receiving this one-time reminder because you started signing up for NotchUp Slash.", unsubscribe: unsubUrl(p.email), preheader: "No charge was made. Finish in two minutes — $0 today, first $15 on your payday." }),
    text: `Hi ${fn}, you started setting up Slash and didn't finish. No charge was made and everything you entered is saved.

Finishing takes about two minutes. Here's how paying works now:
- $0 today. Your first $15 comes out on your next payday — you pick the date.
- Keep 100% of every dollar Slash wins off your bills. We take $0.
- Change your mind before payday? Cancel from your billing link and you're never charged.

Finish setting up: ${p.resumeUrl}

This is the only reminder we'll send. Reply with any questions.
Unsubscribe: ${unsubUrl(p.email)}`,
  };
}

// ── day-3 nurture (one email, leads who never converted) ──
export function nurture(p: { name?: string | null; email: string; url: string }): Tpl {
  const fn = firstName(p.name);
  const row = (bill: string, before: number, after: number) => `<tr><td style="padding:11px 14px;border-bottom:1px solid #E0DFF4;font-size:14.5px;color:#17163A;"><strong>${bill}</strong></td><td style="padding:11px 8px;border-bottom:1px solid #E0DFF4;font-size:14px;color:#8A8A99;text-align:right;white-space:nowrap;"><s>$${before}/mo</s></td><td style="padding:11px 14px;border-bottom:1px solid #E0DFF4;font-size:14.5px;color:#17163A;text-align:right;white-space:nowrap;">≈ <strong>$${after}/mo</strong> <span style="color:#1E8E4A;font-weight:700;">save $${before - after}</span></td></tr>`;
  return {
    subject: subjectFor(p.name, "Canadians save an estimated $487/yr on these 3 bills"),
    html: shell(`
      ${H2("What Canadians actually get back when someone pushes on the bill.")}
      ${P(`Hi ${fn}. Rogers, Bell and Telus raise your rate a little every year and bet you won't ask about it. When someone does ask, the retention team has a lower rate ready. Here's what that typically looks like on common Canadian plans:`)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E0DFF4;border-radius:10px;margin:0 0 8px;">
        ${row("Home internet", 105, 71)}${row("Mobile (all lines)", 85, 58)}${row("TV / cable", 40, 27)}
      </table>
      <p style="margin:0 0 16px;font-size:12.5px;line-height:1.5;color:#8A8A99;">Estimates at the ~32% a retention offer typically takes off comparable Canadian plans. For a typical household that's about <strong style="color:#17163A;">$487 a year</strong>. Your result depends on your plan and provider.</p>
      ${P("The catch is that getting it means calling in, waiting on hold, and arguing with a script. Almost nobody does. <strong>Slash does it for you:</strong> it logs into your account, finds the expired promo, the loyalty pricing and the fees that can be waived, and negotiates with retention. You see the before-and-after and say yes or no. Every dollar it wins is yours.")}
      <div style="background:#F7F6FE;border:1.5px solid #4F4EA5;border-radius:12px;padding:16px 18px;margin:0 0 6px;">
        <p style="margin:0 0 10px;font-size:14.5px;line-height:1.6;color:#17163A;"><strong>You pay nothing today.</strong> Your first $15 comes out on your next payday, and you can cancel before then and never be charged. Keep 100% of the savings.</p>
        <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#4F4EA5;border-radius:999px;"><a href="${p.url}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:700;color:#FFFFFF;text-decoration:none;">Start for $0 today</a></td></tr></table>
      </div>`,
      { reason: "You're receiving this because you started signing up for NotchUp Slash. This is our only follow-up. Savings figures are estimates, not a guarantee.", unsubscribe: unsubUrl(p.email), preheader: "Internet $105 → about $71. Mobile $85 → about $58. That's what asking gets you. Slash asks for you." }),
    text: `Hi ${fn}. Rogers, Bell and Telus raise your rate a little every year and bet you won't ask. When someone does ask, retention has a lower rate ready. What that typically looks like on common Canadian plans (estimates at ~32% off):

- Home internet: $105/mo → about $71 (save $34)
- Mobile, all lines: $85/mo → about $58 (save $27)
- TV / cable: $40/mo → about $27 (save $13)

For a typical household that's about $487 a year. Your result depends on your plan and provider.

Getting it means calling in, waiting on hold and arguing with a script — almost nobody does. Slash does it for you: it logs into your account, finds the expired promo, the loyalty pricing and the waivable fees, and negotiates with retention. You approve or reject. Every dollar it wins is yours.

You pay nothing today. First $15 on your next payday; cancel before then and you're never charged. Start: ${p.url}

This is our only follow-up. Unsubscribe: ${unsubUrl(p.email)}`,
  };
}

// ── win-back campaign for people who reached checkout under the old pay-today model ──
export function winback(p: { name?: string | null; email: string; url: string }): Tpl {
  const fn = firstName(p.name);
  return {
    subject: subjectFor(p.name, "we changed how you pay for Slash: $0 today"),
    html: shell(`
      ${H2("You got as far as the card. We fixed the part that stopped you.")}
      ${P(`Hi ${fn}. You set up Slash this week and stopped at the payment step. A lot of people did, and we think we know why: paying $15 on a random Wednesday isn't how anyone's month works.`)}
      ${P("<strong>So we changed it.</strong> Nothing is charged today. You tell us your next payday, and the first $15 comes out then.")}
      ${dealBox([
        "<strong>$0 today.</strong> First $15 on the payday you choose.",
        "<strong>Keep 100%</strong> of every dollar Slash wins. We take $0.",
        "Cancel before payday from your billing link and you're never charged. After that, 30-day money back, no questions.",
      ])}
      ${P("Everything you entered is saved. Pick a payday, add a card, done.")}
      ${btn(p.url, "Finish for $0 today")}
      ${priceLine}
      <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#54539B;">Questions? Reply to this email. A real person answers.</p>`,
      { reason: "You're receiving this because you started signing up for NotchUp Slash this week.", unsubscribe: unsubUrl(p.email), preheader: "Nothing charged today. Your first $15 comes out on the payday you choose." }),
    text: `Hi ${fn}. You set up Slash this week and stopped at the payment step. A lot of people did, and we think we know why: paying $15 on a random Wednesday isn't how anyone's month works.

So we changed it. Nothing is charged today. You tell us your next payday, and the first $15 comes out then.
- $0 today. First $15 on the payday you choose.
- Keep 100% of every dollar Slash wins. We take $0.
- Cancel before payday and you're never charged. After that, 30-day money back, no questions.

Everything you entered is saved: ${p.url}

Questions? Reply to this email. Unsubscribe: ${unsubUrl(p.email)}`,
  };
}

// ── apply-funnel opt-in follow-up (scheduled ~5 min after they tap "Show me how" on apply.notchup.app) ──
export function applyOptin(p: { name?: string | null; email: string; url: string }): Tpl {
  const fn = firstName(p.name);
  return {
    subject: `${fn === "there" ? "Here’s" : `${fn}, here’s`} how Slash lowers your bills`,
    html: shell(`
      ${H2("You asked us to show you how Slash works. Here it is.")}
      ${P(`Hi ${fn}. A few minutes ago, while applying with NotchUp, you tapped <strong>“Show me how”</strong> on Slash. Here’s the whole thing in one email.`)}
      ${P("Slash is an AI agent that logs into your Rogers, Bell or Telus account, finds the overcharges — expired promos, loyalty pricing you were never offered, equipment fees — and negotiates them down with the retention team. You pass along one sign-in code and approve the win. No hold music. No awkward calls.")}
      ${dealBox([
        "<strong>$0 today.</strong> Your first $15 comes out on your next payday — you pick the date.",
        "<strong>Keep 100%</strong> of every dollar Slash wins off your bills. We take $0 of your savings, ever.",
        "<strong>Cancel anytime.</strong> Before payday from your billing link and you’re never charged; after that, 30-day money back, no questions.",
      ])}
      ${P("A typical Canadian household saves an estimated <strong>$487 a year</strong> on phone, internet and TV. Add as many bills as you like under the one $15.")}
      ${btn(p.url, "Start for $0 today")}
      ${priceLine}
      <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#54539B;">Questions? Reply to this email. A real person answers.</p>`,
      { reason: "You're receiving this because you asked to learn about NotchUp Slash while applying with NotchUp.", unsubscribe: unsubUrl(p.email), preheader: "$0 today. Keep 100% of the savings. Cancel anytime." }),
    text: `Hi ${fn}. A few minutes ago, while applying with NotchUp, you tapped "Show me how" on Slash. Here's the whole thing in one email.

Slash is an AI agent that logs into your Rogers, Bell or Telus account, finds the overcharges — expired promos, loyalty pricing you were never offered, equipment fees — and negotiates them down with the retention team. You pass along one sign-in code and approve the win. No hold music. No awkward calls.

- $0 today. Your first $15 comes out on your next payday — you pick the date.
- Keep 100% of every dollar Slash wins. We take $0 of your savings, ever.
- Cancel anytime. Before payday and you're never charged; after that, 30-day money back.

A typical Canadian household saves an estimated $487 a year on phone, internet and TV.

Start for $0 today: ${p.url}

Questions? Reply to this email. Unsubscribe: ${unsubUrl(p.email)}`,
  };
}

// ── 3 days before the first charge ──
export function paydayReminder(p: { name?: string | null; payday: string; manageUrl: string }): Tpl {
  const fn = firstName(p.name); const day = paydayLabel(p.payday);
  return {
    subject: subjectFor(p.name, `your first $15 comes out ${day}`),
    html: shell(`
      ${H2(`Your first Slash payment is ${day}.`)}
      ${P(`Hi ${fn}, a quick heads up so nothing surprises you: on <strong>${day}</strong> we'll charge the card you saved <strong>$15.00 CAD</strong>. That's the payday you picked when you signed up.`)}
      ${P("If that day no longer works, or you'd rather not continue, open your billing page. Cancelling before then means you're never charged. No forms, no call.")}
      ${btn(p.manageUrl, "Open my billing page")}
      ${SMALL("After the first payment, it's $15 on the same day each month, and you keep 100% of every dollar Slash saves you. Reply to this email if you have any questions.")}`,
      { reason: "You're receiving this because you subscribed to NotchUp Slash.", preheader: `On ${day} we'll charge the card you saved $15.00 CAD. Cancel before then and you're never charged.` }),
    text: `Hi ${fn}, a quick heads up: on ${day} we'll charge the card you saved $15.00 CAD — the payday you picked when you signed up.

If that day no longer works, or you'd rather not continue, open your billing page: ${p.manageUrl}
Cancelling before then means you're never charged.

After the first payment it's $15 on the same day each month, and you keep 100% of what Slash saves you.`,
  };
}

// ── send / schedule / cancel ──
export async function sendTpl(to: string, tpl: Tpl, opts: { scheduledAt?: Date; tag?: string; listUnsubscribe?: string } = {}) {
  if (!process.env.RESEND_API_KEY) { console.log("slash email skipped (no RESEND_API_KEY):", tpl.subject, to); return { id: null as string | null }; }
  const { data, error } = await resend.emails.send({
    from: FROM, to: [to], replyTo: REPLY_TO, subject: tpl.subject, html: tpl.html, text: tpl.text,
    ...(opts.scheduledAt && { scheduledAt: opts.scheduledAt.toISOString() }),
    ...(opts.tag && { tags: [{ name: "campaign", value: opts.tag }] }),
    ...(opts.listUnsubscribe && { headers: { "List-Unsubscribe": `<${opts.listUnsubscribe}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } }),
  });
  if (error) throw new Error(`resend: ${error.message}`);
  return { id: data?.id ?? null };
}
export async function cancelScheduled(id: string | null | undefined) {
  if (!id) return;
  try { await resend.emails.cancel(id); } catch (e) { console.warn("resend cancel failed (already sent?)", id, (e as Error).message); }
}
