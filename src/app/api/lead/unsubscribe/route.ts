import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { unsubToken, cancelScheduled } from "@/lib/slash-emails";

async function handle(req: NextRequest) {
  const e = (req.nextUrl.searchParams.get("e") ?? "").trim().toLowerCase();
  const t = req.nextUrl.searchParams.get("t") ?? "";
  const ok = !!e && t === unsubToken(e);
  if (ok) {
    const lead = await prisma.lead.findUnique({ where: { email: e } });
    if (lead) {
      await Promise.all([cancelScheduled(lead.abandonEmailId), cancelScheduled(lead.nurtureEmailId)]);
      await prisma.lead.update({ where: { id: lead.id }, data: { unsubscribedAt: new Date(), abandonEmailId: null, nurtureEmailId: null } });
    } else {
      await prisma.lead.create({ data: { email: e, name: "", unsubscribedAt: new Date() } });
    }
  }
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Unsubscribed</title></head>
<body style="margin:0;background:#F0F0F5;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;"><div style="max-width:480px;margin:60px auto;background:#fff;border-radius:16px;padding:32px;text-align:center;">
<h1 style="font-size:20px;color:#17163A;margin:0 0 10px;">${ok ? "You're unsubscribed." : "That link didn't work."}</h1>
<p style="font-size:15px;line-height:1.6;color:#54539B;margin:0;">${ok ? "We won't send you any more Slash sign-up emails. Subscription receipts and account emails still arrive if you subscribe." : "Reply to the email you received and we'll take you off the list by hand."}</p></div></body></html>`;
  return new NextResponse(html, { status: ok ? 200 : 400, headers: { "Content-Type": "text/html; charset=utf-8" } });
}
export const GET = handle;
export const POST = handle; // List-Unsubscribe-Post one-click
