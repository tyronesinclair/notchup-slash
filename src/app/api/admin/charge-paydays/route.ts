import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { chargeDuePaydays } from "@/lib/paydays";

// Admin: "Charge everyone whose payday has arrived" (the manual counterpart of the cron).
export async function POST() {
  const token = (await cookies()).get("admin_token")?.value;
  if (!token || token !== process.env.ADMIN_SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const out = await chargeDuePaydays();
  return NextResponse.json(out);
}
