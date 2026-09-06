import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { chargeDuePaydays } from "@/lib/paydays";

// Admin: "Charge everyone whose payday has arrived" (the manual counterpart of the cron).
export async function POST(req: NextRequest) {
  const token = (await cookies()).get("admin_token")?.value;
  if (!token || token !== process.env.ADMIN_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // Optional { paymentId } → charge just that subscriber now (ignores their payday).
  let paymentId: string | undefined;
  try { const b = await req.json(); if (typeof b?.paymentId === "string") paymentId = b.paymentId; } catch {}
  const out = await chargeDuePaydays(paymentId ? { paymentId } : {});
  return NextResponse.json(out);
}
