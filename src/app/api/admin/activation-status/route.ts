import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

const VALID = new Set(["not_started", "in_progress", "activated", "failed"]);

// Sets a customer's activation status (operator marks activated / failed).
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || token !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { customerId, status } = await req.json();
  if (!customerId || !VALID.has(status)) {
    return NextResponse.json({ error: "customerId and a valid status are required" }, { status: 400 });
  }

  await prisma.customer.update({
    where: { id: customerId },
    data: { activationStatus: status },
  });

  return NextResponse.json({ ok: true, status });
}
