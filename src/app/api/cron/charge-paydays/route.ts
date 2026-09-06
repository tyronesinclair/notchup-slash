import { NextRequest, NextResponse } from "next/server";
import { chargeDuePaydays } from "@/lib/paydays";

// Daily safety net: Stripe charges at trial_end by itself; this catches anything that
// slipped (and syncs rows). Call with Authorization: Bearer $CRON_SECRET.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const out = await chargeDuePaydays();
  return NextResponse.json(out);
}
export const POST = GET;
